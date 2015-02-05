hoodie-plugin-profile
====================

[![Build Status](https://travis-ci.org/goappes/hoodie-plugin-profile.svg?branch=master)](https://travis-ci.org/goappes/hoodie-plugin-profile) [![Dependencies](https://david-dm.org/goappes/hoodie-plugin-profile.png)](https://david-dm.org/goappes/hoodie-plugin-profile) [![devDependency Status](https://david-dm.org/goappes/hoodie-plugin-profile/dev-status.svg)](https://david-dm.org/goappes/hoodie-plugin-profile#info=devDependencies) [![Code Climate](https://codeclimate.com/github/goappes/hoodie-plugin-notification/badges/gpa.svg)](https://codeclimate.com/github/goappes/hoodie-plugin-profile)

## Dependencies

install this: https://github.com/rnewson/couchdb-lucene

configure the local.ini of couch db with follow lines

```
[external]
fti=/usr/bin/python /opt/couchdb-lucene/tools/couchdb-external-hook.py

[httpd_db_handlers]
_fti = {couch_httpd_external, handle_external_req, <<"fti">>}
```

and couchdb-lucene with this:
```
[local]
url = http://admin:admin@localhost:6003/
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


