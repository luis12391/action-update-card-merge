const _core = require("@actions/core");
const _axios = require("axios");

//Required parameters
const clickup_api_url = _core.getInput("clickup_api_url");
const clickup_token = _core.getInput("clickup_token");

const headers = {
  headers: {
    Authorization: clickup_token,
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
  },
};

const getSpaceByTeamIdAndSpaceName = async (itemId, spaceName) => {
  const get_spaces_url = `${clickup_api_url}team/${itemId}/space`;
  const spaces = await _axios.get(get_spaces_url, headers);
  return spaces.data.spaces.find((item) => item.name == spaceName);
};

const getFolderlessListsBySpaceId = async (spaceId) => {
  const get_folderless_lists_url = `${clickup_api_url}space/${spaceId}/list`;
  const lists = await _axios.get(get_folderless_lists_url, headers);
  return lists.data.lists;
};

const getTasksByListId = async (listId) => {
  const get_tasks_url = `${clickup_api_url}list/${listId}/task`;
  const task = await _axios.get(get_tasks_url, headers);
  return task.data?.tasks;
};

const getTasksById = async (id) => {
  const get_task_url = `${clickup_api_url}task/${id}`;
  const task = await _axios.get(get_task_url, headers);
  return task.data;
};

const updateTaskByIds = async (tasks, newStatus, parentId) => {
  tasks.forEach(async (task) => {
    const put_tasks_url = `${clickup_api_url}task/${task.id}`;
    task.status = newStatus;
    task.parent = parentId;
    const result = await _axios.put(put_tasks_url, task, headers);
  });
};

const createNewTaskByListId = async (
  listId,
  title,
  description,
  status,
  tags
) => {
  const new_task_url = `${clickup_api_url}list/${listId}/task`;
  const newTask = {
    name: `${title}`,
    tags: tags,
    status: `${status}`,
    description: `${description}`,
  };

  const mainTask = await _axios.post(new_task_url, newTask, headers);
  return mainTask.data;
};

module.exports = {
  getSpaceByTeamIdAndSpaceName,
  getFolderlessListsBySpaceId,
  getTasksByListId,
  updateTaskByIds,
  createNewTaskByListId,
  getTasksById
};
