const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Recipe name is required'],
      trim: true,
      minlength: [2, 'Recipe name must be at least 2 characters'],
    },
    cuisine: {
      type: String,
      required: [true, 'Cuisine is required'],
      trim: true,
    },
    prepTimeMinutes: {
      type: Number,
      required: [true, 'Preparation time is required'],
      min: [1, 'Preparation time must be at least 1 minute'],
    },
    ingredients: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recipe', recipeSchema);
