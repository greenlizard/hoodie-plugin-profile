var async = require('async'),
    utils = require('hoodie-utils-plugins')('profile:db'),
    log = utils.debug(),
    ExtendedDatabaseAPI = utils.ExtendedDatabaseAPI;

module.exports = function (hoodie, dbname) {

  /**
   * Profile _dbname
   */

  var db = new ExtendedDatabaseAPI(hoodie, hoodie.database(dbname));

  /**
   * Profile dbAdd
   */

  var dbAdd = function (hoodie, callback) {
    hoodie.database.add(dbname, function (err) {
      callback(err);
    });
  };

  var addLookupByUserName = function (callback) {

    var index = {
      map: function (doc) {
        if (doc.userName)
          emit(doc.userName, doc.userId);
      }
    };

    db.addIndex('by_userName', index, function (err) {
      if (err) {
        return callback(err);
      }

      return callback();
    });
  };

  /**
   * Profile userFilter
   */

  db.userFilter = function (userDb, callback) {
    var filterFunction = function (doc, req) {
      if (doc.type === req.query.key) {
        return true;
      } else {
        return false;
      }
    };

    userDb.addFilter('profile_by_type', filterFunction, function (err) {
      if (err) {
        return callback(err);
      }

      return callback();
    });
  };
  /**
   * Profile userFilter
   */

  var addPluginFilterUserId = function (callback) {
    var filterFunction = function (doc, req) {
      if (doc.userId === req.query.key) {
        return true;
      } else {
        return false;
      }
    };

    db.addFilter('profile_by_userId', filterFunction, function (err) {
      if (err) {
        return callback(err);
      }

      return callback();
    });
  };




  async.series([
    async.apply(dbAdd, hoodie),
    async.apply(addLookupByUserName),
    async.apply(addPluginFilterUserId),
  ],
  function (err) {
    if (err) {
      console.error(
        'setup db error() error:\n' + (err.stack || err.message || err.toString())
      );
    }
  });

  return db;
};
