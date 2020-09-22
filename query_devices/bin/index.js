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

async function listDevicesMatchingOS() {
  const devicesWithOwner = await balena.pine.get({
    resource: 'device',
    options: {
      // FIXME: I'm trying to get devices that have been online within
      // last N days.  Not sure if last_connectivity_event captures that.
      $select: ['os_version', 'uuid', 'last_connectivity_event'],
      $filter: {
	$or: [
	  {
            os_version: {
              $startswith: 'Resin OS 1.0.',
            },
	  },
	  {
            os_version: {
              $startswith: 'Resin OS 2.0.',
            },
	  },
	  {
            os_version: {
              $startswith: 'Resin OS 2.1.',
            },
	  },
	  {
            os_version: {
              $startswith: 'Resin OS 2.2.',
            },
	  },
	  {
            os_version: {
              $startswith: 'Resin OS 2.3.',
            },
	  },
	  {
            os_version: {
              $startswith: 'Resin OS 2.4.',
            },
	  },
	  {
            os_version: {
              $startswith: 'Resin OS 2.5.',
            },
	  },
	  {
            os_version: {
              $startswith: 'Resin OS 2.6.',
            },
	  },
	  {
            os_version: {
              $startswith: 'Resin OS 2.7.',
            },
	  },
	  {
            os_version: {
              $startswith: 'Resin OS 2.8.',
            },
	  },
	  {
            os_version: {
              $startswith: 'Resin OS 2.9.',
            },
	  },
	  {
            os_version: {
              $startswith: 'Resin OS 2.10.',
            },
	  },
	  {
            os_version: {
              $startswith: 'Resin OS 2.11.',
            },
	  },
	  {
            os_version: {
              $startswith: 'Resin OS 2.12.',
            },
	  },
	  {
            os_version: {
              $startswith: 'Resin OS 2.13.',
            },
	  },
	]
      },
      $expand: {
        belongs_to__application: {
          $select: 'id',
          $expand: {
            organization: {
              $filter: {
                billing_account_code: {
                  $ne: null,
                },
              },
            },
          },
        },
      },      
    },
  });

  return devicesWithOwner;
}

listDevicesMatchingOS()
  .then(devices => {
    console.log(devices);
    console.log("Total devices:", devices.length);
    const paidDevices = devices.filter(
      device => device.belongs_to__application[0].organization.length > 0,
    );
    console.log("Total paid devices:", paidDevices.length);
  })
  .catch(err => {
    console.log("Noo! an error!");
    throw(err);
  })
