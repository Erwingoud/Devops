# Recipe Box Platform

A small Node.js microservice project for the DevOps assignment. The structure matches the example solution more closely: the application code lives inside `services/`, while Docker Compose, Prometheus and alerts are configured at the project root.

## Structure

```text
recipeBoxApp/
├── docker-compose.yml
├── prometheus.yml
├── alert.yml
├── services/
│   ├── recipeBoxApi/
│   │   ├── src/
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── mealPlannerService/
│   │   ├── src/
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── grafana/
│       ├── Dockerfile
│       ├── provisioning/
│       └── dashboards/
```

## Services

| Service                | Purpose                                                                   | URL                            |
| ---------------------- | ------------------------------------------------------------------------- | ------------------------------ |
| `recipe-box-api`       | Public API with `GET` and `POST` recipes                                  | `http://localhost:3000`        |
| `meal-planner-service` | Consumes recipe events and stores meal planning suggestions in its own DB | `http://localhost:3002/health` |
| `rabbitmq`             | Message queue used between services                                       | `http://localhost:15672`       |
| `prometheus`           | Live monitoring for both Node services                                    | `http://localhost:9090`        |
| `grafana`              | Live dashboard for both Node services                                     | `http://localhost:3001`        |

RabbitMQ login: `guest` / `guest`  
Grafana login: `admin` / `admin`

## API endpoints

Recipe Box API:

```text
GET  /health
GET  /metrics
GET  /recipes
GET  /recipes/:id
POST /recipes
```

Example:

```bash
curl -X POST http://localhost:3000/recipes \
  -H "Content-Type: application/json" \
  -d '{"name":"Pasta pesto","cuisine":"Italian","prepTimeMinutes":20,"ingredients":["pasta","pesto","parmesan"]}'
```

Meal Planner Service:

```text
GET /health
GET /metrics
```

The meal planner is not the public assignment API. It receives `recipe.created` messages from RabbitMQ, creates a meal plan suggestion, and stores it in its own MongoDB database.

## Run with Docker

```bash
docker compose up --build
```

## Run tests and linting

Recipe Box API:

```bash
cd services/recipeBoxApi
npm install
npm test
npm run lint
```

Meal Planner Service:

```bash
cd services/mealPlannerService
npm install
npm test
npm run lint
```

No `package-lock.json` is included. You can generate it yourself with `npm install`.

## Monitoring

Prometheus scrapes both services:

- `recipe-box-api:3000/metrics`
- `meal-planner-service:3001/metrics`

Grafana has a provisioned dashboard named **Recipe Box Platform** with panels for both services.

CI status:
[![CI](https://github.com/Erwingoud/Devops/actions/workflows/ci.yml/badge.svg)](https://github.com/Erwingoud/Devops/actions/workflows/ci.yml)
