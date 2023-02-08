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
    const cardTitle = `[${projectType}] Release`;
    const cardDescription = ``;
    const { custom_id } = await createReleaseCard(cardTitle, cardDescription);
    _core.exportVariable("card_custom_id", custom_id);
    console.log("Custom card id: ", custom_id);
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

  await sleep(1000);

  const task = await _service.getTasksById(newTask.id);

  return task;
};

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

module.exports = crateClickupReleaseCard;
