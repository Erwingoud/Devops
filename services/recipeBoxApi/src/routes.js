const express = require('express');
const Recipe = require('./recipeModel.js');
const { recipesCreatedCounter } = require('./metrics.js');
const { publishRecipeCreated } = require('./rabbitmq.js');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find({}).sort({ createdAt: -1 });
    res.json({ recipes });
  } catch {
    res.status(500).json({ error: 'Could not fetch recipes' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    return res.json({ recipe });
  } catch {
    return res.status(400).json({ error: 'Invalid recipe id' });
  }
});

router.post('/', async (req, res) => {
  try {
    const recipe = await Recipe.create(req.body);
    await publishRecipeCreated(recipe);
    recipesCreatedCounter.inc();

    res.status(201).json({ recipe });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Could not create recipe' });
  }
});

module.exports = router;
