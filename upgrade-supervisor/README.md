# upgrade-supervisor

An experiment to see if I can trigger a supervisor update on a device.

# Questions

The call to `device.setSupervisorRelease` is giving me this error:

```
[DEBUG] Setting device e492d594537faf2432872295cc3190ef to be managed by supervisor ID 7334
(node:33894) UnhandledPromiseRejectionWarning: TypeError: Cannot read property 'device' of undefined
    at setSupervisorRelease (/home/hugh/dev/github.com/balena-io-playground/node-cli/upgrade-supervisor/bin/index.js:67:22)
    at /home/hugh/dev/github.com/balena-io-playground/node-cli/upgrade-supervisor/bin/index.js:109:5
    at processTicksAndRejections (internal/process/task_queues.js:97:5)
```
Why is the device undefined?  What am I doing wrong here?`

```
(node:33894) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). To terminate the node process on unhandled promise rejection, use the CLI flag `--unhandled-rejections=strict` (see https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode). (rejection id: 1)
(node:33894) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
```

Why is the error not handled by the .catch block in my code?

- The return from the SDK call to `balena.models.device.get()`
  includes this part:

```
is_of__device_type: { __deferred: { uri:/ '/resin/device_type(@id)?@id=77' }, __id: 77 },
```

Why is the output of `balena.models.device.get` different from the API
device resource
(https://www.balena.io/docs/reference/api/resources/device/)?  The API
device resource includes `device_type`.

I assume I'm meant to make my own API call to the URI that's returned
in `is_of__device_type` -- is that correct?  Is there a better way to
get the device type using the SDK?

# Full Output

```
$ node . -u e492d594537faf2432872295cc3190ef
[DEBUG] I am gh_saintaardvark
[DEBUG] Device from API:  {
  id: 368796,
  belongs_to__application: {
    __deferred: { uri: '/resin/application(@id)?@id=107741' },
    __id: 107741
  },
  belongs_to__user: null,
  is_managed_by__device: null,
  actor: 435133,
  should_be_running__release: null,
  device_name: 'purple-voice',
  is_of__device_type: { __deferred: { uri: '/resin/device_type(@id)?@id=77' }, __id: 77 },
  uuid: 'e492d594537faf2432872295cc3190ef',
  is_running__release: {
    __deferred: { uri: '/resin/release(@id)?@id=115778' },
    __id: 115778
  },
  note: null,
  local_id: null,
  status: 'Idle',
  is_online: true,
  last_connectivity_event: '2020-08-05T22:33:57.700Z',
  is_connected_to_vpn: true,
  last_vpn_event: '2020-08-05T22:33:57.700Z',
  ip_address: '192.168.23.245',
  mac_address: null,
  vpn_address: '10.240.16.9',
  public_address: '70.68.134.32',
  os_version: 'balenaOS 2.48.0+rev1',
  os_variant: 'dev',
  supervisor_version: '10.8.0',
  should_be_managed_by__supervisor_release: {
    __deferred: { uri: '/resin/supervisor_release(@id)?@id=6293' },
    __id: 6293
  },
  is_managed_by__service_instance: {
    __deferred: { uri: '/resin/service_instance(@id)?@id=48219' },
    __id: 48219
  },
  provisioning_progress: null,
  provisioning_state: '',
  download_progress: null,
  is_web_accessible: false,
  longitude: '-122.9011',
  latitude: '49.2189',
  location: 'New Westminster, British Columbia, Canada',
  custom_longitude: '',
  custom_latitude: '',
  logs_channel: null,
  is_locked_until__date: null,
  is_accessible_by_support_until__date: '2020-07-17T23:48:42.291Z',
  created_at: '2020-07-14T17:23:09.776Z',
  is_active: true,
  api_heartbeat_state: 'online',
  __metadata: { uri: '/resin/device(@id)?@id=368796' }
}
[DEBUG] Device type: { __deferred: { uri: '/resin/device_type(@id)?@id=77' }, __id: 77 }
[DEBUG] Looking for  https://api.balena-staging.com/v5/supervisor_release?$filter=device_type%20eq%20'raspberrypi4-64'
[DEBUG] Release:  {
  id: 7334,
  supervisor_version: 'v10.6.33',
  device_type: 'raspberrypi4-64',
  image_name: 'balena/aarch64-supervisor',
  __metadata: { uri: '/resin/supervisor_release(@id)?@id=7334' }
}
[DEBUG] Setting device e492d594537faf2432872295cc3190ef to be managed by supervisor ID 7334
(node:33894) UnhandledPromiseRejectionWarning: TypeError: Cannot read property 'device' of undefined
    at setSupervisorRelease (/home/hugh/dev/github.com/balena-io-playground/node-cli/upgrade-supervisor/bin/index.js:67:22)
    at /home/hugh/dev/github.com/balena-io-playground/node-cli/upgrade-supervisor/bin/index.js:109:5
    at processTicksAndRejections (internal/process/task_queues.js:97:5)
(node:33894) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). To terminate the node process on unhandled promise rejection, use the CLI flag `--unhandled-rejections=strict` (see https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode). (rejection id: 1)
(node:33894) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
```

# License

Apache 2.0; see LICENSE.
