/**
 * Hoodie plugin profile
 * Lightweight and easy profile
 */

/**
 * Dependencies
 */
var Profile = require('./lib');

/**
 * Profile worker
 */

module.exports = function (hoodie, callback) {

  var profile = new Profile(hoodie);

  // hoodie.task.on('subscribe:add', profile.subscribe);
  // hoodie.task.on('unsubscribe:add', profile.unsubscribe);
  // hoodie.task.on('subscribers:add', profile.subscribers);
  // hoodie.task.on('subscriptions:add', profile.subscriptions);
  hoodie.task.on('profileget:add', profile.get);

  hoodie.account.on('user:change', profile.addFilterEachUser);

  callback();

};
