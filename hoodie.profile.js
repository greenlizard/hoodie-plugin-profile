/**
 * Hoodie plugin profile
 * Lightweight and easy profile
 */

/* global Hoodie */

Hoodie.extend(function (hoodie) {
  'use strict';

  hoodie.profile = {

    search: function (term) {
      var defer = window.jQuery.Deferred();
      defer.notify('profilesearch', arguments, false);
      var task = {
        profile: {
          term: term + '*'
        }
      };
      hoodie.task('profilesearch').start(task)
        .then(defer.resolve)
        .fail(defer.reject);
      hoodie.remote.push();
      return defer.promise();
    },

    get: function (userId) {
      var defer = window.jQuery.Deferred();
      defer.notify('get', arguments, false);
      if (!!userId && userId !== hoodie.id()) {
        var task = {
          profile: {
            userId: userId
          }
        };
        hoodie.task('profileget').start(task)
          .then(defer.resolve)
          .fail(defer.reject);
        hoodie.remote.push();
      } else {
        hoodie.store.find('profile', hoodie.id())
          .then(function (doc) {
            defer.resolve({ profile: doc });
          })
          .fail(function (err) {
            defer.reject(err);
          });
      }
      return defer.promise();
    },

    set: function (profile) {
      var defer = window.jQuery.Deferred();
      defer.notify('set', arguments, false);
      hoodie.store.save('profile', profile.userId, profile)
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    }
  };

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
