<p align="center">
  <a href="https://hyperstacksinc.com/" target="blank"><img src="https://hyperstacksinc.com/wp-content/uploads/2024/07/horizontal-logomark-hyperOrange-2-300x74.png" width="640" alt="HS Logo" /></a>
</p>


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

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ yarn install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Important Links
To access the images from the `docker-compose.yml` file, here are the relevant link

1. PGAdmin: http://localhost:8888
2. Swagger Docs: http://localhost:3000/docs

## Features

1. Accounts Onboarding
2. Authentication
3. Reset password (TODO)
4. Funds Transfer (TODO)
5. Transfer History (TODO)