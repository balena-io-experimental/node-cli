#!/usr/bin/env node

const fs = require('fs');
const yargs = require('yargs');

const balenaUrl = "https://api.balena-staging.com/";
const balenaToken = "/home/hugh/.balena/token.staging";
const { getSdk } = require('balena-sdk');
const balena = getSdk({
  apiUrl: balenaUrl
});

// See https://github.com/yargs/yargs/issues/745#issuecomment-269879831
const options = yargs
      .usage('Usage: $0 <command> <options>')
      .command('upgrade', 'Upgrade supervisor on device to specified version', yargs => {
	yargs
	  .option('uuid', {
	    desc: 'uuid for the device',
	    demand: 'Please specify a uuid for the device'
	  })
	  .option('supervisor', {
	    desc: 'supervisor version to upgrade to',
	    demand: 'Please specify a supervisor version'
	  })
	  .demandOption(['uuid', 'supervisor'], 'Please provide both uuid and version arguments')
      }, argv => {
	argv._handled = true;
	console.log(`Preparing to upgrade device ${argv.uuid} to supervisor version ${argv.supervisor}`);
	upgradeSupervisor(argv.uuid, argv.supervisor);
      })
      .command('list-supervisor-versions', 'List supervisor versions available', yargs => {
	yargs
	  .option('devicetype', {
	    desc: 'device type (eg: raspberrypi4-64)'
	  })
	  .option('uuid', {
	    desc: 'Search for versions available for specified device'
	  })
      }, argv => {
	argv._handled = true;
	console.log('Preparing to list supervisor versions');
	listSupervisorReleases(argv.devicetype, argv.uuid);
      })
      .demandCommand(1, 'Please specify a command to run')
      .help()
      .argv;


async function initializeBalenaAuth() {
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
}

async function listSupervisorReleases(deviceType, uuid) {
  // Doubled slashes *will not work*.  IOW, it's `${balenaUrl}v5/...`,
  // not `${balenaUrl}/v5/...`
  if (typeof deviceType === 'string') {
    reqUrl = `${balenaUrl}v5/supervisor_release?$filter=device_type%20eq%20'${deviceType}'`;
    console.log("[DEBUG] Looking for ", reqUrl);
    return await balena.request.send({url: reqUrl})
      .then(data => {
	// FIXME: implicit assumption that highest id === highest semantic version
	var results = data.body.d;
	var highest = results.sort((a, b) => a.id - b.id)[results.length - 1]
	return highest;
      });
  } else if (typeof deviceType === 'string') {
    getDeviceByUUID(uuid)
      .then(device => {
	console.log("[DEBUG] Device from API: ", device);
	return device;
      })
      .then(device )
  } else {
    console.log("Weird, don't know what those args are: ", deviceType, uuid )
  }
}

async function setSupervisorRelease(id, deviceUUID) {
  console.log("[DEBUG] Setting device", deviceUUID, "to be managed by supervisor ID", id);
  // Originally, I had the SDK call wrong and was getting this error:

  // (node:33536) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). To terminate the node process on unhandled promise rejection, use the CLI flag `--unhandled-rejections=strict` (see https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode). (rejection id: 1)
  // (node:33536) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.

  // xginn8 has pointed out that I'm mixing up my try/catch methods,
  // so I need to get that sorted out.

  await balena.models.device.setSupervisorRelease(deviceUUID, id)
    .then(result => {
      console.log("Worked! ", result);
    })
    .catch(error => {
      console.log("Error: ", error);
    })
}

async function getDeviceByUUID(deviceUUID) {
  console.log(`[DEBUG] Searching for device ${deviceUUID}`)
  return await balena.models.device.get(deviceUUID)
    .then(device => {
      return device;
    });
}

async function upgradeSupervisor(uuid, supervisor) {
  getDeviceByUUID(uuid)
    .then(device => {
      console.log("[DEBUG] Device from API: ", device);
      return device;
    })
    .then(device => {
      // FIXME: I don't understand what's going on here.  First off, I
      // (probably naively) expect `device` in this context to be the
      // same as the API device resource
      // (https://www.balena.io/docs/reference/api/resources/device/).
      // That API resource has "device_type" as a member of "device."

      // But with the SDK, instead of `device.device_type` I get:

      // is_of__device_type: { __deferred: { uri:/ '/resin/device_type(@id)?@id=77' }, __id: 77 },

      // Second, I'm not sure what to do with __deferred here.  It looks
      // like something I should resolve, but how?  Am I meant to use
      // the URI to construct a bare API call?

      // For now, I'm cheating and just setting the device type manually
      // to match my particular device.
      return listSupervisorReleases("raspberrypi4-64")
    })
    .then(release => {
      console.log("[DEBUG] Release: ", release);
      setSupervisorRelease(release.supervisor_version, uuid);
    })
}
