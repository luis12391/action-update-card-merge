const addClickupReleaseCard = require("./actions/addClickupReleaseCard");
const crateClickupReleaseCard = require("./actions/createClickupReleaseCard");

const actionTypes = require("./consts/actionTypes");

function actionFactory() {
  this.createAction = function (type) {
    switch (type) {
      case actionTypes.ADD_SUBTASKS_TO_RELEASE_CARD:
        return addReleaseCard();
      case actionTypes.CREATE_CLICKUP_RELEASE_CARD:
        return crateReleaseCard();
      default:
        throw `The action type is wrong: ${type}`;
    }
  };

  function githubAction(taskToExec) {
    this.exec = async () => await taskToExec();
  }

  function addReleaseCard() {
    return new githubAction(() => addClickupReleaseCard());
  }

  function crateReleaseCard() {
    return new githubAction(() => crateClickupReleaseCard());
  }
}

const build = () => {
  return new actionFactory();
};

module.exports = { build };
