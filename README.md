# NestJS demo backend project

Test backend project contains API requests, swagger documentation, e2e and unit tests.

Technologies:
- NestJS as a framework;
- TypeScript as a language;
- Jest as test framework/runner;
- RxJS;


## How to run a project locally

1) Download LTS version of [Node JS](https://nodejs.org/en/download/) from official site

2) Open the project folder on your computer using IDE (for example [Web Storm](https://www.jetbrains.com/webstorm/))

3) The project contains a "package.json" file that contains a list of all required libraries and dependencies. To install them all, enter the command "yarn install" in the terminal

4) You need to execute one of the commands in the terminal to start the project:
- "yarn run start" - main command to run nest project
- "yarn run start:dev" - run nest project in "watch" mode
- "yarn run start:debug" - run nest project in "watch" and "debug" mode
- "yarn run start:prod" - create a prod build of application and also run nest project

When the server starts successfully your project will be running on port - localhost:3000
```bash
yarn run start
yarn run start:dev
yarn run start:debug
yarn run start:prod
```

## Usage API
The test project allows you to make a request to get list with all github repositories for user or organization by github user name, which are not forks.

To view the route and its input / output data, follow the link to the swagger documentation [http://localhost:3000/api](http://localhost:3000/api)

On the swagger documentation page you can run routes in real time and observe the result when entering different input data.

Basic requirements of the request:

1) The main request to get all the repositories is as follows: "http://localhost:3000/api/repositories/{userName}"
2) Github API has a limit on the number of requests.
    - For an unauthorized user - 60 per hour
    - For an authorized user - 5000 per hour

   So you can send your OAuth2 token from your github account as {header “Authorization: #########”} to make authorized requests.
   You can create your OAuth2 token by following the link https://github.com/settings/tokens
3) Given {userName}, {header “Accept: application/json”}, you will get all github repositories, which are not forks and for each branch it’s name and last commit sha.
4) Given not existing github {userName}, you will get 404 response
5) Given {header “Accept: application/xml”}, you will get 406 response


## E2E and Unit tests
All the main functionality of the project is covered by tests.

To run Unit tests, run the following command in the terminal "yarn run test"
```bash
yarn run test
```
To run E2E tests, run the following command in the terminal "yarn run test:e2e"
```bash
yarn run test:e2e
```
To run all unit tests with cover information, run the following command in the terminal "yarn run test:cov"
```bash
yarn run test:cov
```

## Pre-commit run unit tests with Husky
Pay attention that project has hook for pre-commit run unit tests.
So before each commit to git unit tests will run and if some test will fail your commit will rollback.

### Technologies and frameworks

- [NestJS](https://nestjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Jest](https://jestjs.io/)
- [Swagger](https://swagger.io/)
