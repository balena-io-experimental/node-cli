#!/usr/bin/env node

const fs = require('fs');
const semver = require('semver');

var argv = require('yargs')
    .options({
      'env': {
	alias: 'e',
	describe: 'Environment (staging / prod / local)',
	demandOption: true,
	default: 'staging'
      },
    })
    .help()
    .argv;

const STAGING_BALENA_URL = 'https://api.balena-staging.com';
const PROD_BALENA_URL = 'https://api.balena-cloud.com';
const LOCAL_BALENA_URL = 'https://api.my.devenv.local';
var BALENA_URL;

switch (argv.env) {
case 'local':
  BALENA_URL = LOCAL_BALENA_URL;
  break;
case 'prod':
  BALENA_URL = PROD_BALENA_URL;
  break;
default:
  BALENA_URL = STAGING_BALENA_URL;
  break;
}

const balena = require('balena-sdk').getSdk({apiUrl: BALENA_URL});

async function getAffectedDevices() {
  const devicesWithOwner = await balena.pine.get({
    resource: 'device',
    options: {
      // FIXME: I'm trying to get devices that have been online within
      // last N days.  Not sure if last_connectivity_event captures that.
      $select: ['os_version', 'uuid', 'last_connectivity_event'],
      $filter: {
        // is_online: true,
        $or: [
          {
            os_version: {
              $startswith: '2.13',
            },
          },
        ],
      },
    },
  });

  return devicesWithOwner;
}

listBadSupervisorVersions().
  then(data => {
    console.dir(data, {'maxArrayLength': null});
  });
