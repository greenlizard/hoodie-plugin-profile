/**
 * Hoodie plugin profile
 * Lightweight and easy profile
 */

/* global Hoodie */

Hoodie.extend(function (hoodie) {
  'use strict';

  hoodie.profile = {

    
    subscribe: function (userId, subject) {
      var defer = window.jQuery.Deferred();
      defer.notify('subscribe', arguments, false);
      var task = {
        userId: userId,
        subject: subject
      };
      hoodie.task('subscribe').start(task)
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },

    unsubscribe: function (userId, subject) {
      var defer = window.jQuery.Deferred();
      defer.notify('unsubscribe', arguments, false);
      var task = {
        userId: userId,
        subject: subject
      };
      hoodie.task('unsubscribe').start(task)
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },

    subscribers: function (userId) {
      var defer = window.jQuery.Deferred();
      defer.notify('subscribers', arguments, false);
      var task = {
        userId: userId || hoodie.id()
      };
      hoodie.task('subscribers').start(task)
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },

    subscriptions: function (userId) {
      var defer = window.jQuery.Deferred();
      defer.notify('subscriptions', arguments, false);
      var task = {
        userId: userId || hoodie.id()
      };
      hoodie.task('subscriptions').start(task)
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },

    getByUserName: function (username) {
      var defer = window.jQuery.Deferred();
      defer.notify('get', arguments, false);
      if (!!username) {
        var task = {
          get: {
            username: username
          }
        };
        hoodie.task('profilegetbyusername').start(task)
          .then(defer.resolve)
          .fail(defer.reject);
      } else {
        defer.reject('must be pass username as a parameter');
      }
      return defer.promise();
    },
  
    get: function (userId) {
      var defer = window.jQuery.Deferred();
      defer.notify('get', arguments, false);
      if (!!userId) {
        var task = {
          get: {
            userId: userId
          }
        };
        hoodie.task('profileget').start(task)
          .then(defer.resolve)
          .fail(defer.reject);
      } else {
        hoodie.store.find('profile', hoodie.id())
          .then(defer.resolve)
          .fail(defer.reject);
      }
      return defer.promise();
    }
  };
  
  // var debugPromisseGstart = function (text) {
  //   var defer = window.jQuery.Deferred();
  //   (window.debug === 'profile') && console.groupCollapsed(text);
  //   defer.resolve({});
  //   return defer.promise();
  // };

  // var debugPromisseGend = function () {
  //   var defer = window.jQuery.Deferred();
  //   (window.debug === 'profile') && console.groupEnd();
  //   defer.resolve({});
  //   return defer.promise();
  // };

  function out(name, obj, task) {
    if (window.debug === 'profile') {
      var group = (task) ? 'task: ' + task + '(' + name + ')': 'method: ' + name;

      console.groupCollapsed(group);
      if (!!obj)
        console.table(obj);
      console.groupEnd();
    }
  }
  
  if (window.debug === 'profile') {
    hoodie.task.on('start', function () {
      out('start', arguments[0], arguments[0].type);
    });

    // task aborted
    hoodie.task.on('abort', function () {
      out('abort', arguments[0], arguments[0].type);
    });

    // task could not be completed
    hoodie.task.on('error', function () {
      out('error', arguments[1], arguments[1].type);
    });

    // task completed successfully
    hoodie.task.on('success', function () {
      out('success', arguments[0], arguments[0].type);
    });
  }

});
