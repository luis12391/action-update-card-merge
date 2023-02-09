const _core = require("@actions/core");
const _service = require("../services/clickup");

//Required parameters
const clickup_api_url = _core.getInput("clickup_api_url");
const clickup_token = _core.getInput("clickup_token");
const gonni_team_id = _core.getInput("team_id");
const branch_name = _core.getInput("branch_name");
const space_name = _core.getInput("space_name");
const shortProjectName = _core.getInput("short_project_name");
const projectType = _core.getInput("project_type");
const toListName = _core.getInput("to_list_name");

//Optional parameters
let spaceId = _core.getInput("space_id");
let toListId = _core.getInput("to_list_id");
const newStatus = _core.getInput("new_status");
const newTag = _core.getInput("new_tag");

const crateClickupReleaseCard = async () => {
  if (checkRequiredParameters()) {
    const cardDescription = ``;
    const restOfbranchName = branch_name.split("/")[1];
    const cardTitle = `[${projectType}] Release ${restOfbranchName}`;
    const { custom_id } = await createReleaseCard(cardTitle, cardDescription);
    _core.exportVariable("card_custom_id", custom_id);
    _core.exportVariable("version_name", restOfbranchName);
    console.log("Custom card id: ", custom_id);
    console.log("Version name: ", restOfbranchName);
  } else {
    throw `There are required parameters for this action that have not been set correctly`;
  }
};

const checkRequiredParameters = () => {
  if (
    clickup_api_url &&
    clickup_token &&
    gonni_team_id &&
    space_name &&
    branch_name &&
    shortProjectName &&
    projectType &&
    toListName
  ) {
    return true;
  }
  return false;
};

const createReleaseCard = async (title, description) => {
  if (!toListId) {
    if (!spaceId) {
      const space = await _service.getSpaceByTeamIdAndSpaceName(
        gonni_team_id,
        space_name
      );
      spaceId = space.id;
    }
    const folderlessLists = await _service.getFolderlessListsBySpaceId(spaceId);
    const toList = folderlessLists.find((l) => l.name == toListName);
    toListId = toList.id;
  }

  const newTask = await _service.createNewTaskByListId(
    toListId,
    title,
    description,
    newStatus || "backlog",
    [newTag] || ["feature"]
  );

  const msTowait = 2500;
  const amountRetries = 10;

  const newReleaseTask = await retry(
    msTowait,
    amountRetries,
    newTask.id,
    async (id) => await isThereCustomId(id)
  );

  return newReleaseTask;
};

const isThereCustomId = async (id) => {
  const task = await _service.getTasksById(id);
  if (task.custom_id) {
    return { isDataFound: true, data: { ...task } };
  }
  return { isDataFound: false };
};

const retry = (ms, amount, parameter, callback) => {
  return new Promise((resolve) => {
    let count = 0;
    let idInterval = setInterval(async () => {
      const result = await callback(parameter);
      if (count > amount || result.isDataFound) {
        clearInterval(idInterval);
        resolve(result.data);
      }
    }, ms);
  });
};

module.exports = crateClickupReleaseCard;
