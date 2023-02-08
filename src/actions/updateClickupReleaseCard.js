const core = require("@actions/core");
const axios = require("axios");
const textProccessor = require("../utils/textProcessor");

//Required parameters
const clickup_api_url = core.getInput("clickup_api_url");
const clickup_token = core.getInput("clickup_token");
const gonni_team_id = core.getInput("team_id");
const space_name = core.getInput("space_name");
const newStatus = core.getInput("new_status");
const fromListName = core.getInput("from_list_name");
const toListName = core.getInput("to_list_name");
const pr_body = core.getInput("pr_body");
const pr_title = core.getInput("pr_title");
const shortProjectName = core.getInput("short_project_name");

//Optional parameters
let spaceId = core.getInput("space_id");
let fromListId = core.getInput("from_list_id");
let toListId = core.getInput("to_list_id");

const updateClickupReleaseCard = async () => {
  if (checkRequiredParameters()) {
    await moveTaskByIdsToNewStatus(newStatus, gonni_team_id, space_name);
  }else{
    throw `There are required parameters for this action that have not been set correctly`;
  }
};

const headers = {
  headers: {
    Authorization: clickup_token,
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
  },
};

const getSpaceByTeamIdAndSpaceName = async (itemId, spaceName) => {
  const get_spaces_url = `${clickup_api_url}team/${itemId}/space`;
  const spaces = await axios.get(get_spaces_url, headers);
  return spaces.data.spaces.find((item) => item.name == spaceName);
};

const getFolderlessListsBySpaceId = async (spaceId) => {
  const get_folderless_lists_url = `${clickup_api_url}space/${spaceId}/list`;
  const lists = await axios.get(get_folderless_lists_url, headers);
  return lists.data.lists;
};

const getTasksByListId = async (listId) => {
  const get_tasks_url = `${clickup_api_url}list/${listId}/task`;
  const task = await axios.get(get_tasks_url, headers);
  return task.data?.tasks;
};

const updateTaskByIds = async (tasks, newStatus, parentId) => {
  tasks.forEach(async (task) => {
    const put_tasks_url = `${clickup_api_url}task/${task.id}`;
    task.status = newStatus;
    task.parent = parentId;
    const result = await axios.put(put_tasks_url, task, headers);
  });
};

const createNewTaskByListId = async (listId) => {
  const new_task_url = `${clickup_api_url}list/${listId}/task`;
  const newTask = {
    name: `Release Task from node (Es una prueba, tengo que borrarlo) - responsable Luis ${pr_title}`,
    tags: ["feature"],
    status: "backlog",
  };

  const mainTask = await axios.post(new_task_url, newTask, headers);
  return mainTask.data;
};

const getTaskIdsFormDescriptionPr = (description, shortProjectName) => {
  const taskIds = textProccessor.getIdsFromDescription(
    description,
    shortProjectName
  );
  return taskIds;
};

const moveTaskByIdsToNewStatus = async (newStatus, team_id, space_name) => {
  if (!fromListId || !toListId) {
    if (!spaceId) {
      const space = await getSpaceByTeamIdAndSpaceName(team_id, space_name);
      spaceId = space.id;
    }

    const folderlessLists = await getFolderlessListsBySpaceId(spaceId);

    if (!fromListId) {
      const fromList = folderlessLists.find((l) => l.name == fromListName);
      fromListId = fromList.id;
    }
    if (!toListId) {
      const toList = folderlessLists.find((l) => l.name == toListName);
      toListId = toList.id;
    }
  }

  const tasks = await getTasksByListId(fromListId);
  const taskIdsToMove = getTaskIdsFormDescriptionPr(pr_body, shortProjectName);

  const tasksToMove = tasks.filter((t) => taskIdsToMove.includes(t.custom_id));

  console.log("Creating new main card");
  const mainTask = await createNewTaskByListId(toListId);

  console.log("Associating cards " , taskIdsToMove.toString(), " with main card: ", mainTask.id );
  await updateTaskByIds(tasksToMove, newStatus, mainTask.id);
};

const checkRequiredParameters = () => {
  if (clickup_api_url && clickup_token && gonni_team_id && space_name &&
    newStatus && fromListName && toListName && pr_body && pr_title && shortProjectName) {
      return true;
  }
  return false;
}

module.exports = updateClickupReleaseCard ;
