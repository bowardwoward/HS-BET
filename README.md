<p align="center">
  <a href="https://hyperstacksinc.com/" target="blank"><img src="https://hyperstacksinc.com/wp-content/uploads/2024/07/horizontal-logomark-hyperOrange-2-300x74.png" width="640" alt="HS Logo" /></a>
</p>

## Features

- Account Onbooarding 🏄 
- Funds Transfer 💸
- Mailing Capabilites 💌
- Reset Password 🔃
- Swagger Documentation with Authentication 😎
- Custom Validation pipeline 🪈
- ~~Prisma ORM for even more typesafety with database~~ Moved over to typeORM 📐
- Typesafe using Zod schemas ✅
- API validation for incoming response 🧳
- Account Retrieval 🏃‍♂️
- Secure Authentication 💂‍♂️

## Description

Backend Excercise Training by Hyperstacks

## Project setup
Create your own env variables for use with the API
```bash
$ cp .env.example .env
```

Build the required Docker images (requires Docker)
```bash
$ docker compose up
```

Install dependencies
```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Important Links
To access the images from the `docker-compose.yml` file, here are the relevant link

1. PGAdmin: http://localhost:8888
2. Swagger Docs: http://localhost:3000/docs
3. Mailhog Web UI: http://localhost:8025

> If you have installed an SQL client on your local system you can also pipe it to the postgres service. just copy the config PGSQL config from the .env (but why tho? just use the containerize service to make things easy).
