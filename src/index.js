const action = require("./actionFactory");

//Required parameters
const action_type = core.getInput("action_type");

const bootstrap = async () => {
    console.log(`The ${action_type} action is being processed`);
    action.createAction(action_type);
    await action.exec(action_type);
    console.log("The action has been processed successfully");
}

bootstrap();