const updateClickupReleaseCard = require("./actions/updateClickupReleaseCard");
const crateClickupReleaseCard = require("./actions/createClickupReleaseCard");

const actionTypes = require("./consts/actionTypes");

function actionFactory() {
  this.createAction = function (type) {
    switch (type) {
      case actionTypes.CREATE_SUBTASKS_IN_RELEASE_CARD:
        return updateReleaseCard();
      case actionTypes.CREATE_CLICKUP_RELEASE_CARD:
        return crateReleaseCard();
      default:
        throw `The action type is wrong: ${type}`;
    }
  };

  function githubAction(taskToExec) {
    this.exec = async () => await taskToExec();
  }

  function updateReleaseCard() {
    return new githubAction(() => updateClickupReleaseCard());
  }

  function crateReleaseCard() {
    return new githubAction(() => crateClickupReleaseCard());
  }
}

const build = () => {
  return new actionFactory();
};

module.exports = { build };
