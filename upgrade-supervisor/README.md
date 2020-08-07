# upgrade-supervisor

An experiment to see if I can trigger a supervisor update on a device.

# Usage

Upgrade supervisor for a device:

```
node . upgrade --uuid e492d59 --supervisor 12.3.1
```

List supervisor versions available for a device:

```
node . list-supervisor-versions --uuid e492d59
```

# TODOs, shortcomings & accusations


- The provided supervisor version is not respected when upgrading;
  instead, we just upgrade to the supervisor version with the highest
  ID (and assume that's the semantically-highest version available).

- We don't check to see if the device is *already* running this version.

- We don't list all supervisor versions -- just the one with the
  highest ID.

- There are lots of places we should be checking errors.  I'm new at
  JavaScript and I'm sure it shows.

# License

Apache 2.0; see LICENSE.
