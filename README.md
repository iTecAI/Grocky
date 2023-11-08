# Grocky

Collaborative shopping list app

### Standards:

- Datetime storage: UTC datetime objects
  - Objects on the backend, strings on the frontend

### Development:

This program is designed to run in a docker context.

**Running W/ External Server:**
- Navigate to `docker/debug_external`
- Create a `.env` file with the desired settings
- Run `docker-compose up`

**Running In Standalone Mode:**
- Navigate to `docker/debug_standalone`
- Create a `.env` file with the desired settings
- Run `reset.sh` as root to create the required directories
- Run `docker-compose up`

