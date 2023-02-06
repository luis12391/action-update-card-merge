const createClickUpReleaseCard = require("./actions/createReleaseCard");
const actionTypes = require("./consts/actionTypes");

function actionFactory() {
  this.createAction = function (type) {
    switch (type) {
      case actionTypes.CREATE_CLICKUP_RELEASE_CARD:
        return createReleaseCardOnClickup();
      default:
        throw `The action type is wrong: ${type}`;
    }
  };

  function githubAction(taskToExec) {
    this.exec = async () => await taskToExec();
  }

  function createReleaseCardOnClickup() {
    return new githubAction(() => createClickUpReleaseCard());
  }
}

const build = () => {
  return new actionFactory();
};

module.exports = { build };
