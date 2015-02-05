var async = require('async'),
    utils = require('hoodie-utils-plugins')('profile:db'),
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


  var addFtiByUserName = function (callback) {

    var index = {
      index: function (doc) {
        var result = new Document();
        result.add(doc.userName, {"field":"userName"});
        result.add(doc.name, {"field":"name", "boost": 2});
        result.add(new Date(), {"field":"indexed_at"});
        return result;
      }
    };

    db.addFti('by_fti', index, function (err) {
      if (err) {
        return callback(err);
      }

      return callback();
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


/**
* Add configuration of couchdb lucene on db
*/
/*
  var addLuceneConfig = function (cb) {
    var payload = '{couch_httpd_proxy, handle_proxy_req, <<"http://127.0.0.1:5985">>}';
    var opt = {
      headers: {
        'Content-Type': 'application/text'
      },
      callback_on_data: function () {
        console.log(arguments)
      }
    };
//    debugger;
//    hoodie.request('PUT', '_config/httpd_global_handlers/_fti', { data: payload }, opt, cb);
  }
*/

  async.series([
    async.apply(dbAdd, hoodie),
    async.apply(addLookupByUserName),
    async.apply(addPluginFilterUserId),
    async.apply(addFtiByUserName),
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
