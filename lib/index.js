var ProfileApi = require('./profile');
//var NetworkApi = require('./network');
var Db = require('./db');
var _ = require('lodash');
var utils = require('hoodie-utils-plugins')('profile:index');
var ExtendedDatabaseAPI = utils.ExtendedDatabaseAPI;
var async = require('async');

module.exports = function (hoodie) {
  var profile = {};
  var dbPluginName = 'plugins/hoodie-plugin-profile';
  var pluginDb = new Db(hoodie, dbPluginName);

  _.extend(profile,  new ProfileApi(hoodie, pluginDb));
//  _.extend(profile,  new NetworkApi(hoodie, pluginDb));

  /**
   * Profile dbName
   */

  profile.addProfileEachUser = function (_doc) {
    if (_doc.$error) {
      // don't do any further processing to user docs with $error
      return;
    } else if (_doc._deleted && !_doc.$newUsername) {
      return;
    } else if (_doc.roles && _doc.roles.indexOf('confirmed') >= 0) {
      var userDbName = 'user/' + _doc.hoodieId;
      var userDb = new ExtendedDatabaseAPI(hoodie, hoodie.database(userDbName));

      var task2plugin = {
        profile: {
          subject: 'profile',
          filter: 'profile_by_type',
          sourceDbName: userDbName,
          targetDbName: dbPluginName
        }
      };

      var task2user = {
        profile: {
          subject: _doc.hoodieId,
          filter: 'profile_by_userId',
          sourceDbName: dbPluginName,
          targetDbName: userDbName
        }
      };

      var _profile = {
        id: _doc.hoodieId,
        db: userDbName,
        userId: _doc.hoodieId,
        userName: _doc.name.split('/').pop()
      };

      async.series([
        async.apply(pluginDb.userFilter, userDb),
        async.apply(profile.createReplication, userDbName, task2plugin),
        async.apply(profile.createReplication, userDbName, task2user),
        async.apply(userDb.add, 'profile', _profile),
        async.apply(userDb.add, 'security', _profile)
      ],
      function (err) {
        outerr = err && err.response && err.response.req && 'method: ' + err.response.req.method + ' ';
        outerr += err && err.response && err.response.req && 'path: ' + err.response.req.path + ' ';
        if (err) console.error('Profile.ensureUserFilter:', userDbName, err.error, outerr);
      });
    }
  };

  return profile;
};
