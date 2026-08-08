import { SmartSearch, BundleRequest } from '../src/concierge/smartSearch';

describe('SmartSearch Concierge Engine', () => {
  const concierge = new SmartSearch();

  test('should generate complete equipment bundle from natural language query', async () => {
    const request: BundleRequest = {
      naturalLanguageQuery: 'Shooting a 3-day outdoor wedding in low light conditions',
      maxBudget: 20000,
      rentalDays: 3,
    };

    const recommendation = await concierge.recommend(request);

    expect(recommendation.bundle.length).toBeGreaterThan(0);
    expect(recommendation.totalCost).toBeGreaterThan(0);
    expect(recommendation.rentalDays).toBe(3);
    expect(recommendation.upsellSuggestions.length).toBeGreaterThan(0);
  });
});
