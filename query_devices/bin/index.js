#!/usr/bin/env node

// Get a list of devices that are running balenaOS < 2.14.  Further
// filter by devices that have connected recently (going by
// `last_connectivity_event`), and by paid/free customers.  The list
// of *all* devices -- not just recent or paid ones! -- will be written out.

'use strict';

const fs = require('fs');
const semver = require('semver');

const defaultOutputFile = 'devices_lower_than_2.14.json';
const defaultMonthsThreshold = 3;

var argv = require('yargs')
    .options({
      'env': {
	alias: 'e',
	describe: 'Environment (staging / prod / local)',
	demandOption: true,
	default: 'staging'
      },
      'threshold_months': {
	describe: 'How many months ago counts as "recently connected"',
	default: defaultMonthsThreshold,
      },
      'output': {
	decribe: 'Output JSON file',
	default: defaultOutputFile,
      }
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
	// FIXME: This is not great.  If there's a way to do this better, I'm all ears.
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

function dateSomeMonthsAgo (numMonths) {
  let d = new Date();
  d.setMonth(d.getMonth() - numMonths);
  return d;
}

listDevicesMatchingOS()
  .then(devices => {
    console.log("Total devices:", devices.length);
    let threshold = dateSomeMonthsAgo(argv.threshold_months);
    const recentDevices = devices.filter(
      device => Date.parse(device.last_connectivity_event) > threshold,
    );
    console.log(`Devices connected more recently than ${argv.threshold_months} months ago: ${recentDevices.length}`);
    const recentPaidDevices = recentDevices.filter(
      device => device.belongs_to__application[0].organization.length > 0,
    );
    console.log(`Total paid devices, connected more recently than ${argv.threshold_months} months ago: ${recentPaidDevices.length}`);
    console.log(`Writing out **ALL** devices (whether recent or not, paid or not) to ${argv.output}...`);
    fs.writeFileSync(argv.output, JSON.stringify(devices));
  })
  .catch(err => {
    console.log("Noo! an error!");
    throw(err);
  })
