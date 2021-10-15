# Backend developer task

# Acceptance criteria:
As an api consumer, given username and header “Accept: application/json”, I would like to list all his github repositories, which are not forks. Information, which I require in the response, is:
- Repository Name
- Owner Login
- For each branch it’s name and last commit sha

As an api consumer, given not existing github user, I would like to receive 404 response in such a format:
```json
{
	“status”: ${responseCode}
	“Message”: ${whyHasItHappened}
}
```

As an api consumer, given header “Accept: application/xml”, I would like to receive 406 response in such a format:
```json
{
	“status”: ${responseCode}
	“Message”: ${whyHasItHappened}
}
```


# Notes:
1) Please full-fill the given acceptance criteria, delivering us your best code compliant with industry standards.
2) Please use https://developer.github.com/v3 as a backing API
3) Please write your api spec in swagger yaml file
4) Application should have a proper README.md file
5) Add unit and integration test cases.

# Technologies to use:
- NestJS as a framework
- TypeScript as a language
- Jest as test framework/runner (implement unit tests)
- RxJS

# Extended challenge:
- Prepare Dockerfile so that app can be run in a container
- Prepare CloudFormation scripts so that the containerized app will be run as a Fargate service (or directly in ECS - You choose)
- Prepare CloudFormation scripts, that will create API Gateway and expose the app thru it
- Prepare Jenkins pipeline, that will build the app and deploy it to AWS using scripts from steps above (use free tier AWS account)
