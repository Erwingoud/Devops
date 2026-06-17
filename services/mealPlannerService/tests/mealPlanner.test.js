const mockFindOneAndUpdate = jest.fn();

jest.mock('../src/mealPlanModel.js', () => ({
  findOneAndUpdate: (...args) => mockFindOneAndUpdate(...args),
}));

const { buildMealPlan, handleRecipeCreated, pickSuggestedDay } = require('../src/mealPlanner.js');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('meal planner service', () => {
  test('picks a suggested day based on cuisine', () => {
    expect(pickSuggestedDay('Italian')).toBe('Monday');
    expect(pickSuggestedDay('Unknown')).toBe('Sunday');
  });

  test('builds a meal plan from a recipe event', () => {
    const mealPlan = buildMealPlan({
      recipeId: 'recipe-123',
      name: 'Pasta pesto',
      cuisine: 'Italian',
    });

    expect(mealPlan).toEqual({
      recipeId: 'recipe-123',
      recipeName: 'Pasta pesto',
      cuisine: 'Italian',
      suggestedDay: 'Monday',
      note: 'Try Pasta pesto on Monday.',
    });
  });

  test('stores a meal plan for recipe.created events', async () => {
    mockFindOneAndUpdate.mockResolvedValue({ recipeId: 'recipe-123' });

    await handleRecipeCreated({
      event: 'recipe.created',
      recipeId: 'recipe-123',
      name: 'Pasta pesto',
      cuisine: 'Italian',
    });

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { recipeId: 'recipe-123' },
      expect.objectContaining({ recipeName: 'Pasta pesto', suggestedDay: 'Monday' }),
      { new: true, upsert: true, runValidators: true }
    );
  });

  test('rejects unsupported events', async () => {
    await expect(handleRecipeCreated({ event: 'other.event' })).rejects.toThrow('Unsupported event type');
  });
});
