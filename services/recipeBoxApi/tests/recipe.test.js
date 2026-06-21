const request = require('supertest');

jest.mock('../src/rabbitmq.js', () => ({
  connect: jest.fn(),
  publishRecipeCreated: jest.fn().mockResolvedValue(undefined),
}));

const mockRecipe = {
  _id: '64a1b2c3d4e5f6a7b8c9d0e1',
  name: 'Pasta pesto',
  cuisine: 'Italian',
  prepTimeMinutes: 20,
  ingredients: ['pasta', 'pesto'],
  createdAt: new Date().toISOString(),
};

const mockFind = jest.fn();
const mockFindById = jest.fn();
const mockCreate = jest.fn();

jest.mock('../src/recipeModel.js', () => ({
  find: (...args) => mockFind(...args),
  findById: (...args) => mockFindById(...args),
  create: (...args) => mockCreate(...args),
}));

const app = require('../src/app.js');
const { publishRecipeCreated } = require('../src/rabbitmq.js');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /health', () => {
  test('returns service status', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', service: 'recipe-box-api' });
  });
});

describe('GET /recipes', () => {
  test('returns all recipes', async () => {
    const sort = jest.fn().mockResolvedValue([mockRecipe]);
    mockFind.mockReturnValue({ sort });

    const res = await request(app).get('/recipes');

    expect(res.status).toBe(200);
    expect(res.body.recipes).toHaveLength(1);
    expect(res.body.recipes[0].name).toBe('Pasta pesto');
    expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
  });

  test('returns 500 when database fails', async () => {
    const sort = jest.fn().mockRejectedValue(new Error('DB failed'));
    mockFind.mockReturnValue({ sort });

    const res = await request(app).get('/recipes');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Could not fetch recipes');
  });
});

describe('GET /recipes/:id', () => {
  test('returns a recipe by id', async () => {
    mockFindById.mockResolvedValue(mockRecipe);

    const res = await request(app).get('/recipes/64a1b2c3d4e5f6a7b8c9d0e1');

    expect(res.status).toBe(200);
    expect(res.body.recipe.cuisine).toBe('Italian');
  });

  test('returns 404 for unknown recipe', async () => {
    mockFindById.mockResolvedValue(null);

    const res = await request(app).get('/recipes/64a1b2c3d4e5f6a7b8c9d0e2');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Recipe not found');
  });

  test('returns 400 for invalid id', async () => {
    mockFindById.mockRejectedValue(new Error('CastError'));

    const res = await request(app).get('/recipes/not-an-id');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid recipe id');
  });
});

describe('POST /recipes', () => {
  test('creates a recipe', async () => {
    mockCreate.mockResolvedValue(mockRecipe);

    const res = await request(app).post('/recipes').send({
      name: 'Pasta pesto',
      cuisine: 'Italian',
      prepTimeMinutes: 20,
      ingredients: ['pasta', 'pesto'],
    });

    expect(res.status).toBe(201);
    expect(res.body.recipe.name).toBe('Pasta pesto');
    expect(publishRecipeCreated).toHaveBeenCalledWith(mockRecipe);
  });

  test('returns 400 for validation errors', async () => {
    const error = new Error('Recipe name is required');
    error.name = 'ValidationError';
    mockCreate.mockRejectedValue(error);

    const res = await request(app).post('/recipes').send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Recipe name is required');
  });

  test('returns 500 for unexpected errors', async () => {
    mockCreate.mockRejectedValue(new Error('Unexpected'));

    const res = await request(app).post('/recipes').send({
      name: 'Pasta pesto',
      cuisine: 'Italian',
      prepTimeMinutes: 20,
    });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Could not create recipe');
  });
});

describe('GET /metrics', () => {
  test('returns prometheus metrics', async () => {
    const res = await request(app).get('/metrics');

    expect(res.status).toBe(200);
    expect(res.text).toContain('recipe_box_http_request_duration_seconds');
  });
});
