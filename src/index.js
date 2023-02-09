const _core = require("@actions/core");
const _factory = require("./actionFactory");

//Required parameters
const ACTION_TYPE = _core.getInput("action_type");

const bootstrap = async () => {
  console.log(`The ${ACTION_TYPE} action is being processed`);

  const action = _factory.build().createAction(ACTION_TYPE);
  await action.exec(ACTION_TYPE);

  console.log("The action has been processed successfully");
};

bootstrap();
