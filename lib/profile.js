/**
 * Dependencies
 */

var utils = require('hoodie-utils-plugins')('profile:profile');
var log = utils.debug();
var Replicator = utils.ReplicatorAPI;
var async = require('async');
var _ = require('lodash');

module.exports = function (hoodie, pluginDb) {
  var Profile = this;

  var replicator = new Replicator(hoodie);

  var profileId = function (sourceDbName, targetDbName) {
    return [sourceDbName, targetDbName].join('::');
  };


  var replicatorDoc = function (task) {
    var subscribeId = task.profile.subject + '/' + profileId(task.profile.sourceDbName, task.profile.targetDbName);

    return {
      _id: subscribeId,
      source: task.profile.sourceDbName,
      target: task.profile.targetDbName,
      filter: 'filters/'+task.profile.filter,
      query_params: {
        key: task.profile.subject
      },
      user_ctx: {
        roles: [
          'hoodie:read:' + task.profile.sourceDbName,
          'hoodie:write:' + task.profile.targetDbName
        ]
      },
      continuous: true
    };
  };

  var _dbExists = function (task, cb) {
    log('_dbExists', task);
    hoodie.request('HEAD', '/' + encodeURIComponent(task.profile.sourceDbName), {}, function (err, _doc) {
      task.profile.dbExists = !!_doc;
      cb(null, task);
    });
  };

  var _addSubscribe =  function (task, cb) {
    log('_addSubscribe', task);
    if (task.profile.dbExists) {
      return cb('Source database not exists.');
    }

    if (task.profile.isSubscribed) {
      return cb('You already subscribed.');
    }

    var subscribeId = profileId(task.profile.sourceDbName, task.profile.targetDbName);
    var _replicatorDoc = replicatorDoc(task);

    replicator.add(task.profile.subject, subscribeId, _replicatorDoc, function (err) {
      cb(err);
    });
  };

  var _removeSubscribe = function (task, cb) {
    log('_removeSubscribe', task);
    if (!task.profile.isSubscribed) {
      return cb('You are not subscribed.');
    }

    var subscribeId = profileId(task.profile.sourceDbName, task.profile.targetDbName);

    replicator.remove(task.profile.subject, subscribeId, cb);
  };

  var _isSubscribed = function (task, cb) {
    log('_isSubscribed', task);
    var subscribeId = profileId(task.profile.sourceDbName, task.profile.targetDbName);
    replicator.find(task.profile.subject, subscribeId, function (err, _doc) {
      task.profile.isSubscribed = (err.error === 'not_found') ? false : !!_doc;
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
    var method = (!_.isArray(task.profile.userId)) ? 'find' : 'findSome';
    pluginDb[method]('profile', task.profile.userId, function (err, _doc) {
      if (err) return cb(err);
      task.profile = _doc;
      cb(null, task);
    });
  };

  var _getByUsername = function (task, cb) {
    log('_getByUsername', task);
    pluginDb.query('by_userName', { include_docs: true, key: task.profile.userName.toLowerCase() }, function (err, rows) {
      if (err || !rows.length) return cb(err || new Error('not_found'));
      task.profile = rows[0].doc;
      cb(null, task);
    });
  };

  Profile.get = function (db, task) {
    log('get', task);
    async.series([
        async.apply(_validAttrs, task, 'profile'),
        async.apply(_validAttrs, task.profile, 'userId'),
        async.apply(_get, task)
      ],
      utils.handleTask(hoodie, 'get', db, task)
    );
  };

  Profile.getByUserName = function (db, task, cb) {
    log('getByUsername', task);

    async.series([
        async.apply(_validAttrs, task, 'profile'),
        async.apply(_validAttrs, task.profile, 'userName'),
        async.apply(_getByUsername, task)
      ],
      utils.handleTask(hoodie, 'getByUserName', db, task, cb)
    );
  };

  Profile.createReplication = function (db, task, cb) {
    log('createReplication', task);

    async.series([
        async.apply(_validAttrs, task, 'profile'),
        async.apply(_validAttrs, task.profile, 'sourceDbName'),
        async.apply(_validAttrs, task.profile, 'targetDbName'),
        async.apply(_validAttrs, task.profile, 'subject'),
        async.apply(_validAttrs, task.profile, 'filter'),
        async.apply(_dbExists, task),
        async.apply(_isSubscribed, task),
        async.apply(_addSubscribe, task)
      ], utils.handleTask(hoodie, 'removeReplication', db, task, cb)
    );
  };

  Profile.removeReplication = function (db, task, cb) {
    log('removeReplication', task);

    async.series([
        async.apply(_validAttrs, task, 'profile'),
        async.apply(_validAttrs, task.profile, 'sourceDbName'),
        async.apply(_validAttrs, task.profile, 'targetDbName'),
        async.apply(_validAttrs, task.profile, 'subject'),
        async.apply(_isSubscribed, task),
        async.apply(_removeSubscribe, task)
      ],
      utils.handleTask(hoodie, 'removeReplication', db, task, cb)
    );
  };

  return Profile;
};
