const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema(
  {
    recipeId: {
      type: String,
      required: true,
      unique: true,
    },
    recipeName: {
      type: String,
      required: true,
      trim: true,
    },
    cuisine: {
      type: String,
      required: true,
      trim: true,
    },
    suggestedDay: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MealPlan', mealPlanSchema);
