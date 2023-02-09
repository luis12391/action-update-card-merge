const _core = require("@actions/core");
const _service = require("../services/clickup");
const _textProccessor = require("../utils/textProcessor");

//Required parameters
const clickup_api_url = _core.getInput("clickup_api_url");
const clickup_token = _core.getInput("clickup_token");
const gonni_team_id = _core.getInput("team_id");
const space_name = _core.getInput("space_name");
const newStatus = _core.getInput("new_status");
const fromListName = _core.getInput("from_list_name");
const toListName = _core.getInput("to_list_name") || "05 - A TESTEAR";
const pr_body = _core.getInput("pr_body");
const pr_title = _core.getInput("pr_title");
const shortProjectName = _core.getInput("short_project_name");
const branch_name = _core.getInput("branch_name");

//Optional parameters
let spaceId = _core.getInput("space_id");
let fromListId = _core.getInput("from_list_id");
let toListId = _core.getInput("to_list_id");

const addClickupReleaseCard = async () => {
  if (checkRequiredParameters()) {
    const customId = getCustomIdFormReleaseName(branch_name, shortProjectName);
    const { toListId, fromListId } = await getToAndFromListId(
      gonni_team_id,
      space_name
    );

    const [releaseTask, ...array] = await getReleaseTaskByCustomIdAndList(
      customId,
      toListId
    );

    if (!releaseTask)
      throw `Task ${customId} not found in list '${toListName}'`;

    const taskIdsToMove = getTaskIdsFormDescriptionPr(
      pr_body,
      shortProjectName
    );

    const fromListTasks = await _service.getTasksByListId(fromListId);
    const tasksToMove = fromListTasks.filter((t) =>
      taskIdsToMove.includes(t.custom_id)
    );

    console.log(
      "Associating cards ",
      taskIdsToMove.toString(),
      " with release card: ",
      customId,
      "| ",
      releaseTask.url
    );

    await _service.updateTaskByIds(tasksToMove, newStatus, releaseTask.id);
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
    newStatus &&
    fromListName &&
    toListName &&
    pr_body &&
    pr_title &&
    shortProjectName &&
    branch_name
  ) {
    return true;
  }
  return false;
};

const getCustomIdFormReleaseName = (description, shortProjectName) => {
  const taskIds = _textProccessor.getIdsFromDescription(
    description,
    shortProjectName
  );

  const customId = taskIds.length > 0 ? taskIds[0] : "";
  return customId;
};

const getToAndFromListId = async (team_id, space_name) => {
  if (!fromListId || !toListId) {
    if (!spaceId) {
      const space = await _service.getSpaceByTeamIdAndSpaceName(
        team_id,
        space_name
      );
      spaceId = space.id;
    }

    const folderlessLists = await _service.getFolderlessListsBySpaceId(spaceId);

    if (!fromListId) {
      const fromList = folderlessLists.find((l) => l.name == fromListName);
      fromListId = fromList.id;
    }
    if (!toListId) {
      const toList = folderlessLists.find((l) => l.name == toListName);
      toListId = toList.id;
    }
  }
  return { toListId, fromListId };
};

const getReleaseTaskByCustomIdAndList = async (customId, listId) => {
  const tasks = await _service.getTasksByListId(listId);
  const releaseTask = tasks.filter((t) => t.custom_id.includes(customId));
  return releaseTask;
};

const getTaskIdsFormDescriptionPr = (description, shortProjectName) => {
  const taskIds = _textProccessor.getIdsFromDescription(
    description,
    shortProjectName
  );
  return taskIds;
};

module.exports = addClickupReleaseCard;
