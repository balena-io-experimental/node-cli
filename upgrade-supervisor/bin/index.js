#!/usr/bin/env node

const fs = require('fs');
const yargs = require('yargs');

const balenaUrl = "https://api.balena-staging.com/";
const balenaToken = "/home/hugh/.balena/token.staging";
const { getSdk } = require('balena-sdk');
const balena = getSdk({
  apiUrl: balenaUrl
});

const options = yargs
      .usage("Usage: -u [uuid of device] -a [application]")
      .option("u", {alias: "uuid",
		    describe: "UUID of device",
		    type: "string",
		    demandOption: true})
      .argv;

var personalToken = fs.readFileSync(balenaToken, 'utf8');

balena.auth.loginWithToken(personalToken, function(error) {
  if (error) throw error;
})

balena.auth.whoami()
  .then(username => {
    if(username) {
      console.log("[DEBUG] I am", username);
    } else {
      console.log("[DEBUG] I am nobody? I guess?")
    }
  });

async function listSupervisorReleases(deviceType) {
  // Doubled slashes *will not work*.  IOW, it's `${balenaUrl}v5/...`,
  // not `${balenaUrl}/v5/...`
  reqUrl = `${balenaUrl}v5/supervisor_release?$filter=device_type%20eq%20'${deviceType}'`;
  console.log("[DEBUG] Looking for ", reqUrl);
  return await balena.request.send({url: reqUrl})
    .then(data => {
      // FIXME: implicit assumption that highest id === highest semantic version
      var results = data.body.d;
      var highest = results.sort((a, b) => a.id - b.id)[results.length - 1]
      return highest;
    });
}

async function setSupervisorRelease(id, deviceUUID) {
  console.log("[DEBUG] Setting device", deviceUUID, "to be managed by supervisor ID", id);
  // FIXME:  I don't understand what I'm doing wrong here.  The output I get is:

  // [DEBUG] Setting device e492d594537faf2432872295cc3190ef to be managed by supervisor ID 7334
  // (node:33536) UnhandledPromiseRejectionWarning: TypeError: Cannot read property 'device' of undefined
  //     at setSupervisorRelease (/home/hugh/dev/github.com/balena-io-playground/node-cli/upgrade-supervisor/bin/index.js:52:22)
  //     at /home/hugh/dev/github.com/balena-io-playground/node-cli/upgrade-supervisor/bin/index.js:91:5
  //     at processTicksAndRejections (internal/process/task_queues.js:97:5)
  // (node:33536) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). To terminate the node process on unhandled promise rejection, use the CLI flag `--unhandled-rejections=strict` (see https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode). (rejection id: 1)
  // (node:33536) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.

  // I don't understand why:

  // - the .catch block is not catching the error;

  // - why the device is undefined here.

  // This happens whether I use an API token or a Session token.
  await balena.model.device.setSupervisorRelease(deviceUUID, id)
    .then(result => {
      console.log("Worked! ", result);
    })
    .catch(error => {
      console.log("Error: ", error);
    })
}

async function getDeviceByUUID(deviceUUID) {
  return await balena.models.device.get(deviceUUID)
    .then(device => {
      return device;
    });
}

getDeviceByUUID(options.u)
  .then(device => {
    console.log("[DEBUG] Device from API: ", device);
    return device;
  })
  .then(device => {
    return listSupervisorReleases(device.d[0].device_type)
  })
  .then(release => {
    console.log("[DEBUG] Release: ", release);
    setSupervisorRelease(release.id, options.u);
  })
