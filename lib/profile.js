/**
 * Dependencies
 */

var utils = require('hoodie-utils-plugins')('profile:profile');
var log = utils.debug();
var Replicator = utils.ReplicatorAPI;
var async = require('async');

module.exports = function (hoodie, pluginDb) {
  var Profile = this;

  var replicator = new Replicator(hoodie);

  var profileId = function (sourceDbName, targetDbName) {
    return [sourceDbName, targetDbName].join('::');
  };


  var replicatorDoc = function (subject, sourceDbName, targetDbName) {
    var subscribeId = subject + '/' + profileId(sourceDbName, targetDbName);

    return {
      _id: subscribeId,
      source: sourceDbName,
      target: targetDbName,
      filter: 'filters/by_type',
      query_params: {
        type: subject
      },
      user_ctx: {
        roles: [
          'hoodie:read:' + sourceDbName,
          'hoodie:write:' + targetDbName
        ]
      },
      continuous: true
    };
  };

  var _dbExists = function (task, cb) {
    log('_dbExists', task);
    hoodie.request('HEAD', '/' + encodeURIComponent(task.sourceDbName), {}, function (err, _doc) {
      task.dbExists = !!_doc;
      cb(null, task);
    });
  };

  var _addSubscribe =  function (task, cb) {
    log('_addSubscribe', task);
    if (task.dbExists) {
      return cb('Source database not exists.');
    }

    if (task.isSubscribed) {
      return cb('You already subscribed.');
    }

    var subscribeId = profileId(task.sourceDbName, task.targetDbName);
    var _replicatorDoc = replicatorDoc(task.subject, task.sourceDbName, task.targetDbName);

    replicator.add(task.subject, subscribeId, _replicatorDoc, function (err) {
      cb(err);
    });
  };

  var _removeSubscribe = function (task, cb) {
    log('_removeSubscribe', task);
    if (!task.isSubscribed) {
      return cb('You are not subscribed.');
    }

    var subscribeId = profileId(task.sourceDbName, task.targetDbName);

    replicator.remove(task.subject, subscribeId, cb);
  };

  var _isSubscribed = function (task, cb) {
    log('_isSubscribed', task);
    var subscribeId = profileId(task.sourceDbName, task.targetDbName);
    replicator.find(task.subject, subscribeId, function (err, _doc) {
      task.isSubscribed = (err.error === 'not_found') ? false : !!_doc;
      cb(null, task);
    });
  };

  var _validAttrs = function (task, attr, cb) {
    log('_validAttrs', task);
    if (!attr || !task[attr]) {
      return cb('Pls, fill the param: ' + attr);
    }
    cb();
  };

  var _get = function (task, cb) {
    log('_get', task);
    pluginDb.find('profile', task.get.userId, function (err, _doc) {
      if (err) return cb(err);
      task.profile = _doc;
      cb(null, task);
    });
  };

  var _getByUsername = function (task, cb) {
    log('_getByUsername', task);
    pluginDb.query('by_username', {key: task.get.username}, function (err, _doc) {
      if (err) return cb(err);
      task.profile = _doc;
      cb(null, task);
    });
  };

  Profile.createProfile = function (userDb, hoodieId, username, cb) {
    log('createProfile', hoodie);

    var doc = {
      id: hoodieId,
      username: username.split('/').pop()
    };
    userDb.add('profile', doc, cb);
  };

  Profile.createReplication = function (task, cb) {
    log('createReplication', task);
    task.subject = 'profile';
    async.series([
        async.apply(_validAttrs, task, 'sourceDbName'),
        async.apply(_dbExists, task),
        async.apply(_isSubscribed, task),
        async.apply(_addSubscribe, task)
      ], cb);
  };

  Profile.get = function (db, task) {
    log('get', task);
    async.series([
        async.apply(_validAttrs, task, 'get'),
        async.apply(_validAttrs, task, 'get.userId'),
        async.apply(_get, task)
      ],
      utils.handleTask(hoodie, 'get', db, task)
    );
  };

  Profile.getByUsername = function (db, task) {
    log('getByUsername', task);
    async.series([
        async.apply(_validAttrs, task, 'get'),
        async.apply(_validAttrs, task, 'get.username'),
        async.apply(_getByUsername, task)
      ],
      utils.handleTask(hoodie, 'get', db, task)
    );
  };

  Profile.removeReplication = function (db, task) {
    log('removeReplication', task);
    task.subject = 'profile';
    async.series([
        async.apply(_validAttrs, task, 'sourceDbName'),
        async.apply(_isSubscribed, task),
        async.apply(_removeSubscribe, task)
      ],
      utils.handleTask(hoodie, 'removeReplication', db, task)
    );
  };

  return Profile;
};
