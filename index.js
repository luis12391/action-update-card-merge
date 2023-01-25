const core = require('@actions/core');
const axios = require('axios');

console.log(process.env.GITHUB_EVENT_NAME);
console.log(process.env.GITHUB_REF_NAME);

console.log("Commnets: ", core.getInput('comments'));