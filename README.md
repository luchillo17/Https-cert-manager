# https-certificate-manager

This repo is a manager for the `Let's encrypt` cli, it uses gulp for declaring tasks to obtain, manage and update your ssl certificates.

---

## File structure

```sh

https-certificate-manager
├─── .ftppass                 * Auth configs for gulp-sftp package
├─── README.md
├─── LICENSE.md
├─── package.json             * Npm configuration and dependencies
├─── certbot.conf.ini         * Default configuration for all certbot operations
├─── certbot.defaults.json    * Default configurations for this project
├─── gulpfile.js              * Task definition file
└─── server.js                * Test server, use it to test the http protocol wih your new certificates

```

## Install

This project provides a gulp task for installing with CentOS 6, it installs some deps and then downloads the certbot-auto binary in this folder, this is the general unix way of getting certbot locally, it should work for any UNIX OS, for specifics on how to do it for an specific OS go to: [certbot.eff.org](https://certbot.eff.org/#pip-other).

How to install:

First ensure Node 6 and npm is installed (uses some ES6 syntax in gulp tasks), then execute the following command which should install deps as well as running the gulp install task.

```sh
npm i -g gulp-cli && npm i && gulp install
```

---

## Commands

### Help

After installing gulp and repo deps, to understand how to use the gulp cli, use the following:

```sh
gulp
```

The help command is the default task of gulp, the following achieve the same result: `gulp help`.

### Get ssl cert

This command connects to the `Let's encrypt` server through port 443 to validate some data and then it returns all the `.pem` certificates which you should use in each server in which the domain you registered is used, please ensure that this server has port 443 enabled and no server is already listening to such port, if the port is busy, disable the server using it for the duration of this command.

```sh
gulp get-ssl-cert
```

Check the `gulp help` command for specific flags in case you need to override the defaults in `certbot.defaults.json` or edit that file if certain you need to keep some flags as defaults for automatic update.

### Paste ssl remote

This command will use `gulp-sftp` package to upload your new downloaded `.pem` certificates to all the servers defined in `certbot.defaults.json` in their specified `remotePaths` property, such paths are defined in the `paths` property in the same json file, the auth access for those are defined in the `.ftppass` file as specified by the [`gulp-sftp` auth](https://www.npmjs.com/package/gulp-sftp#authentication) section, each server can have it's own config and each server has an `auth` string property that relates to the defined auth information in `.ftppass` json.

```sh
gulp paste-ssl-remote
```

### Update ssl cert

This is the important one, it will call both the `get-ssl-cert` and `paste-ssl-cert` tasks in sequence, as such it accepts the same flags as `get-ssl-cert` task, this is the one that should be set with a cron job to run in cycles of 80 days (certs lasts for 90 days but `Let's encrypt` recommends updating with 10 days of anticipation to have time to deal with any kind of eventuality in the cert request process).

Remember to review the command flags available to this and all commands with `gulp help` and the defaults of the whole process in `certbot.conf.ini` and `certbot.defaults.json`.

```sh
gulp update-ssl-cert
```

## Disclaimer

This repo lacks any way to notify about errors to the user, it's better to attach your notifications on the output of the cron job so you get all the output of the process and you can then guess if the update process works.

## Related links

- [Certbot home page](https://certbot.eff.org/#pip-other)
- [Certbot user guide: command line options](https://certbot.eff.org/docs/using.html#command-line-options)
- [Let's Encrypt home page](https://letsencrypt.org)
