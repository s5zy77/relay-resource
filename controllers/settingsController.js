const Settings = require('../models/Settings');
const { ok } = require('../utils/apiResponse');

async function getSettings(req, res) {
  const vendor = req.user.role === 'vendor' ? req.user.id : req.query.vendor || null;
  let settings = await Settings.findOne({ vendor });
  if (!settings) {
    settings = await Settings.create({ vendor });
  }
  return ok(res, settings);
}

async function updateSettings(req, res) {
  const vendor = req.user.role === 'vendor' ? req.user.id : req.body.vendor || null;
  let settings = await Settings.findOne({ vendor });
  if (!settings) settings = new Settings({ vendor });

  const editable = ['lateFee', 'productDefaults', 'taxPercent'];
  for (const key of editable) {
    if (req.body[key] !== undefined) settings[key] = req.body[key];
  }

  await settings.save();
  return ok(res, settings);
}

module.exports = { getSettings, updateSettings };
