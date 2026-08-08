/**
 * Shared rental pricing calculation.
 * Resolves the applicable PriceList rule per order line, applies min-qty gating
 * and validity windows, computes line amounts, and sums untaxed/tax/total.
 */

const MS_PER_HOUR = 1000 * 60 * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;

const DEFAULT_TAX_PERCENT = 18; // configurable global default (GST-like)

function durationInPeriodicityUnits(start, end, periodicityUnit = 'day') {
  if (!start || !end) return 1;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms <= 0) return 1;
  switch (periodicityUnit) {
    case 'hours':
      return Math.max(1, Math.ceil(ms / MS_PER_HOUR));
    case 'night':
    case 'day':
      return Math.max(1, Math.ceil(ms / MS_PER_DAY));
    case 'weekly':
      return Math.max(1, Math.ceil(ms / (MS_PER_DAY * 7)));
    default:
      return Math.max(1, Math.ceil(ms / MS_PER_DAY));
  }
}

/**
 * Find the best-matching pricelist rule for a given product/qty/date.
 * Fixed price wins over discount if both match; otherwise falls back to base price.
 */
function resolveRuleForLine(priceListDoc, line, baseUnitPrice) {
  if (!priceListDoc || !Array.isArray(priceListDoc.rules)) {
    return { unitPrice: baseUnitPrice, appliedRule: null };
  }

  const now = new Date();
  const candidates = priceListDoc.rules.filter((rule) => {
    const appliesToAll = !rule.appliesTo || rule.appliesTo.length === 0;
    const appliesToProduct =
      appliesToAll ||
      rule.appliesTo.some((pid) => pid.toString() === line.product.toString());
    if (!appliesToProduct) return false;

    if (rule.minQty && line.qty < rule.minQty) return false;

    const validFrom = rule.validFrom ? new Date(rule.validFrom) : null;
    const validTo = rule.validTo ? new Date(rule.validTo) : null;
    if (validFrom && now < validFrom) return false;
    if (validTo && now > validTo) return false;

    return true;
  });

  if (candidates.length === 0) {
    return { unitPrice: baseUnitPrice, appliedRule: null };
  }

  const fixedRule = candidates.find((r) => r.priceType === 'fixed');
  if (fixedRule) {
    return { unitPrice: fixedRule.fixedPrice, appliedRule: fixedRule };
  }

  const discountRule = candidates.find((r) => r.priceType === 'discount');
  if (discountRule) {
    const discounted = baseUnitPrice * (1 - discountRule.discountPercent / 100);
    return { unitPrice: Math.max(0, discounted), appliedRule: discountRule };
  }

  return { unitPrice: baseUnitPrice, appliedRule: null };
}

function calcTotals(order, priceListDoc, productsById) {
  let untaxed = 0;
  let tax = 0;

  const computedLines = order.lines.map((line) => {
    const product = productsById[line.product.toString()];
    const baseUnitPrice = line.unitPrice || (product ? product.salesPrice : 0);
    const periodicityUnit = product?.rental?.periodicityUnit || 'day';

    const { unitPrice, appliedRule } = resolveRuleForLine(priceListDoc, line, baseUnitPrice);

    const duration = durationInPeriodicityUnits(
      line.rentalStart || order.rentalPeriod?.start,
      line.rentalEnd || order.rentalPeriod?.end,
      periodicityUnit
    );

    const amount = unitPrice * line.qty * duration;
    const taxPercent = line.taxPercent ?? DEFAULT_TAX_PERCENT;
    const lineTax = amount * (taxPercent / 100);

    untaxed += amount;
    tax += lineTax;

    return {
      ...line,
      unitPrice,
      amount,
      taxPercent,
      appliedRule: appliedRule ? appliedRule._id : null,
    };
  });

  const total = untaxed + tax;

  return {
    lines: computedLines,
    totals: {
      untaxed: round2(untaxed),
      tax: round2(tax),
      total: round2(total),
    },
  };
}

function calcLateFee(rentalEnd, returnedAt, ratePerHour) {
  if (!rentalEnd || !returnedAt || !ratePerHour) return 0;
  const lateMs = new Date(returnedAt).getTime() - new Date(rentalEnd).getTime();
  if (lateMs <= 0) return 0;
  const lateHours = Math.ceil(lateMs / MS_PER_HOUR);
  return round2(lateHours * ratePerHour);
}

/**
 * Settle-return math: refund = deposit - lateFee - damage
 */
function settleReturn({ depositAmount = 0, lateFee = 0, damageDeduction = 0 }) {
  const refund = Math.max(0, depositAmount - lateFee - damageDeduction);
  return round2(refund);
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

module.exports = {
  calcTotals,
  calcLateFee,
  settleReturn,
  durationInPeriodicityUnits,
  resolveRuleForLine,
  DEFAULT_TAX_PERCENT,
};
