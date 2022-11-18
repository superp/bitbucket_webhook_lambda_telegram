const co = require('co');
const Telegram = require('../lib/telegram');
const config = require('../config');

class WebHook {
  post (req, cb) {
    co(function *() {
      let data = yield composeData(req)
      let message = composeAttachments(data);
      let telegram = new Telegram();

      telegram.sendMessage(message);

      cb(null, message);
    }).catch((error) => {
      cb(error.message);
    });
  }
}

// Internal functions
// Docs https://support.atlassian.com/bitbucket-cloud/docs/event-payloads/#Push
function composeData (body) {
  return new Promise((resolve, reject) => {
    try {
      let actor = body.actor.display_name;
      let repository = {
          name: body.repository.name,
          full_name: body.repository.full_name,
          project: body.repository.project.key
      };

      let commit = '';
      let changeType = '';
      let link = '';
      let branch = '';

      body.push.changes.map((change) => {
        let type = resolveChangeType(change);

        changeType = type.type;
        commit = type.hash;
        link = `${config.bitbucket_url}/${repository.full_name}/commits/${commit}`;
        branch = type.name;
        // commits = `<${link}|${commit.substr(0, 11)}> ${branch}`;
      });

      let message = body.push.changes[0].commits.map(c => c.message).join();

      let data = {
        actor,
        repository,
        changeType,
        branch,
        message,
        commit,
        link
      };

      resolve(data);
    } catch (e) {
      reject(e);
    }
  });
}

function composeAttachments (data) {
  return `<b>Branch:</b> <pre>${data.repository.name} - ${data.branch} / ${data.changeType}</pre>
<b>User:</b> <pre>${data.actor}</pre>
<b>Message:</b> <pre>${data.message}</pre>
<a href="${data.link}">Show commit</a>`
}

function resolveChangeType (change) {
  let type = 'new';
  let hash = '';
  let name = '';
  let message = '';

  if (change.created) {
    type = `${change.new.type.capitalize()} created`;
    hash = change.new.target.hash;
    name = change.new.name;
    message = change.new.target.message;
  } else if (change.closed) {
    type = `${change.old.type.capitalize()} closed`;
    hash = change.old.target.hash;
    name = change.old.name;
    message = change.old.target.message;
  } else {
    hash = change.new.target.hash;
    name = change.new.name;
    message = change.new.target.message;
  }

  return  { type, hash, name, message };
}

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

module.exports = WebHook;