suite('Profile', function () {
  this.timeout(15000);

  suiteSetup(loadUsers);
  suite('Profile test', function () {

    test('signIn hommer', function (done) {
      this.timeout(10000);
      hoodie.account.signIn('Hommer', '123')
        .fail(function (err) {
          done();
          assert.ok(false, err.message);
        })
        .done(function () {
          assert.equal(
            hoodie.account.username,
            'hommer',
            'should be logged in after signup'
          );
          done();
        });
    });

    test('hommer should get own profile', function (done) {
      this.timeout(10000);
      hoodie.profile.get()
        .fail(function (err) {
          done();
          assert.ok(false, err.message);
        })
        .then(function (task) {
          done();
          assert.ok(true, 'getProfile');
        });
    });

    

  });

});
