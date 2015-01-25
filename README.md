hoodie-plugin-profile
====================

[![Build Status](https://travis-ci.org/goappes/hoodie-plugin-profile.svg?branch=master)](https://travis-ci.org/goappes/hoodie-plugin-profile) [![Dependencies](https://david-dm.org/goappes/hoodie-plugin-profile.png)](https://david-dm.org/goappes/hoodie-plugin-profile) [![devDependency Status](https://david-dm.org/goappes/hoodie-plugin-profile/dev-status.svg)](https://david-dm.org/goappes/hoodie-plugin-profile#info=devDependencies) [![Code Climate](https://codeclimate.com/github/goappes/hoodie-plugin-notification/badges/gpa.svg)](https://codeclimate.com/github/goappes/hoodie-plugin-profile)

## Dependencies

install this: https://github.com/rnewson/couchdb-lucene

configure the local.ini of couch db with follow lines

```
[os_daemons]
my_daemon = /opt/couchdb-lucene/target/couchdb-lucene-1.1.0-SNAPSHOT/bin/run

[httpd_global_handlers]
_fti = {couch_httpd_proxy, handle_proxy_req, <<"http://127.0.0.1:5985">>}
```

then:
```shell
  hoodie install hoodie-plugin-profile
```

for cordova/phonegap users
```shell
  bower install hoodie-plugin-profile
```

## Setup client
```html
 <script src="/_api/_files/hoodie.js"></script>
```
for cordova/phonegap users

```html
  <script src="<bowerdir>/hoodie/dist/hoodie.js"></script>
  <script src="<bowerdir>/hoodie-plugin-profile/hoodie.profile.js"></script>
```

## API


