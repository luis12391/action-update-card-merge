const createClickUpReleaseCard = require("./actions/createReleaseCard");
const actionTypes = require("./consts/actionTypes");

const actionFactory = () => {
  createAction = (type) => {
    switch (type) {
      case actionTypes.CREATE_CLICKUP_RELEASE_CARD:
        return new createReleaseCardOnClickup();
      default:
        new Error(`The action type is wrong: ${type}`);
        break;
    }
  };

  githubAction = (taskToExec) => {
    exec = async () => await taskToExec();
  };

  createReleaseCardOnClickup = async () => {
    return new githubAction(await createClickUpReleaseCard());
  };
};

module.exports = { actionFactory };
