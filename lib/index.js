var ProfileApi = require('./profile');
//var NetworkApi = require('./network');
var Db = require('./db');
var _ = require('lodash');
var utils = require('hoodie-utils-plugins')('profile:index');
var ExtendedDatabaseAPI = utils.ExtendedDatabaseAPI;
var async = require('async');

module.exports = function (hoodie) {
  var profile = {};
  var pluginDb = new Db(hoodie, 'plugins/hoodie-plugin-profile');

  _.extend(profile,  new ProfileApi(hoodie, pluginDb));
//  _.extend(profile,  new NetworkApi(hoodie, pluginDb));

  /**
   * Profile dbName
   */

  profile.addFilterEachUser = function (_doc) {
    if (_doc.roles && _doc.roles.indexOf('confirmed') >= 0) {
      var userDbName = 'user/' + _doc.hoodieId;
      var userDb = new ExtendedDatabaseAPI(hoodie, hoodie.database(userDbName));


      async.series([
        async.apply(pluginDb.userFilter, hoodie, userDb),
        async.apply(profile.createProfile, userDb, _doc.hoodieId)
      ],
      function (err) {
        if (err) console.error('Profile.ensureUserFilter:', err);
      });
    }
  };



  return profile;
};
