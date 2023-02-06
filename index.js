const core = require("@actions/core");
const axios = require("axios");

//Required parameters
const clickup_api_url = core.getInput("clickup_api_url");
const clickup_token = core.getInput("clickup_token");
const gonni_team_id = core.getInput("team_id");
const space_name = core.getInput("space_name");
const task_ids_to_move = ["SM-92", "SM-91"];
const newStatus = core.getInput("new_status");
const fromListName = core.getInput("from_list_name");;
const toListName = core.getInput("to_list_name");
const pr_body = core.getInput("pr_body");
const pr_title = core.getInput("pr_title");

//Optional parameters
let spaceId = core.getInput("space_id");
let fromListId = core.getInput("from_list_id");
let toListId = core.getInput("to_list_id");

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

const createNewTaskByListId = async (taskIds, listId) => {
  const new_task_url = `${clickup_api_url}list/${listId}/task`;
  const newTask = {
    name: `Release Task from node (Es una prueba, tengo que borrarlo) - responsable Luis ${pr_title}`,
    description: `These tasks will be implemented in this release: ${taskIds.toString()} ${pr_body}`,
    tags: ["feature"],
    status: "backlog",
  };

  const mainTask = await axios.post(new_task_url, newTask, headers);
  return mainTask.data;
};

const moveTaskByIdsToNewStatus = async (
  task_ids_to_move,
  newStatus,
  team_id,
  space_name
) => {
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
  const tasksToMove = tasks.filter((t) =>
    task_ids_to_move.includes(t.custom_id)
  );
  const mainTask = await createNewTaskByListId(tasksToMove, toListId);

  await updateTaskByIds(tasksToMove, newStatus, mainTask.id);
};

async function start() {
  try {
    await moveTaskByIdsToNewStatus(
      task_ids_to_move,
      newStatus,
      gonni_team_id,
      space_name
    );
  } catch (error) {
    console.log(error);
  }
}
start();
console.log(process.env.GITHUB_EVENT_NAME);
console.log(process.env.GITHUB_REF_NAME);

console.log("Commnets: ", core.getInput("comments"));
