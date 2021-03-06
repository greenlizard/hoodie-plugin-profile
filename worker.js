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

  hoodie.task.on('profileget:add', profile.get);
  hoodie.task.on('profilesearch:add', profile.search);

  hoodie.account.on('user:change', profile.addProfileEachUser);
  callback();

};
