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

  profile.changeProfileEachUser = function (_doc) {
    if (_doc.roles && _doc.roles.indexOf('confirmed') >= 0) {
      var userDbName = 'user/' + _doc.hoodieId;
      var userDb = new ExtendedDatabaseAPI(hoodie, hoodie.database(userDbName));
      var task = {
        sourceDbName: userDbName,
        targetDbName: dbPluginName
      };

      async.series([
        async.apply(pluginDb.userFilter, hoodie, userDb),
        async.apply(profile.createProfile, userDb, _doc.hoodieId, _doc.name),
        async.apply(profile.createReplication, task)
      ],
      function (err) {
        if (err) console.error('Profile.ensureUserFilter:', err);
      });
    }
  };

  return profile;
};
