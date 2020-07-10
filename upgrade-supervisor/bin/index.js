#!/usr/bin/env node

const fs = require('fs');
const yargs = require('yargs');

const balenaUrl = "https://api.balena-staging.com/";
const balenaToken = "/home/hugh/.balena/token.staging";
const getSdk = require('balena-sdk');
const balena = getSdk({
  apiUrl: balenaUrl
});

const options = yargs
      .usage("Usage: -u [uuid of device] -a [application]")
      .option("u", {alias: "uuid",
		    describe: "UUID of device",
		    type: "string",
		    demandOption: true})
      .option("a", {alias: "application",
		    describe: "Application name",
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

async function setSupervisorRelease(id) {
  // # Set supervisor version
  // PATCH :my-url/v5/device?$filter=uuid%20eq%20':my-uuid'
  // :my-auth

  // {"should_be_managed_by__supervisor_release": "6175"}

  console.log(id);
  // For doc on this, see github.com/balena-io/balena-sdk/typings/balena-request.d.ts
  await balena.request.send({
    url: `https://api.balena-staging.com/v5/device?filter=uuid%20eq%20'${myDevice}'`,
    method: "PATCH",
    // Doesn't work: "`${id}` -- Request error: Expected an ID for the supervisor_release
    body: {"should_be_managed_by__supervisor_release": `${id}`}

  }).then(resp => {
    console.log(resp);
    balena.models.device.update(myDevice, {
      force: true
    })},
	  fail => {
	    console.log(fail);
	  });
};

async function getDeviceByUUID(deviceUUID) {
  reqUrl = `${balenaUrl}v5/device?$filter=uuid%20eq%20'${deviceUUID}'`;
  console.log("[DEBUG] Looking for ", reqUrl);
  return await balena.request.send({url: reqUrl})
    .then(data => {
      return data.body;
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

// subscribeToLogs(myApplication)
//   .then(logs => {
//     getDeviceServicesIds(myDevice).then(data => allServiceIds = data);
//     logs.on('line', function(line){
//       logutil.dispatch(line, allServiceIds);
//     })
//   });
