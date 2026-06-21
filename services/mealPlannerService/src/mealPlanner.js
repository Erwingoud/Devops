const MealPlan = require('./mealPlanModel.js');
const { mealPlansCreatedCounter } = require('./metrics.js');

const cuisineDayMap = {
  Italian: 'Monday',
  Mexican: 'Tuesday',
  Indian: 'Wednesday',
  Japanese: 'Thursday',
  Dutch: 'Friday',
};

function pickSuggestedDay(cuisine) {
  return cuisineDayMap[cuisine] || 'Sunday';
}

function buildMealPlan(event) {
  const suggestedDay = pickSuggestedDay(event.cuisine);

  return {
    recipeId: String(event.recipeId),
    recipeName: event.name,
    cuisine: event.cuisine,
    suggestedDay,
    note: `Try ${event.name} on ${suggestedDay}.`,
  };
}

async function handleRecipeCreated(event) {
  if (!event || event.event !== 'recipe.created') {
    throw new Error('Unsupported event type');
  }

  const mealPlan = buildMealPlan(event);

  const storedMealPlan = await MealPlan.findOneAndUpdate(
    { recipeId: mealPlan.recipeId },
    mealPlan,
    { new: true, upsert: true, runValidators: true }
  );

  mealPlansCreatedCounter.inc();
  return storedMealPlan;
}

module.exports = { buildMealPlan, handleRecipeCreated, pickSuggestedDay };
