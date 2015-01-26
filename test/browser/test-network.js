suite('Profile', function () {
  this.timeout(15000);

  suiteSetup(loadUsers);
  suite('Profile test', function () {

    test('anonymous user not should get own profile', function (done) {
      this.timeout(10000);
      hoodie.profile.get()
        .fail(function (err) {
          done();
          assert.ok(true, err.message);
        })
        .then(function (task) {
          done('user should not get own profile');
          assert.ok(false, 'user should not get own profile');
        })
    });

    test('signIn hommer', function (done) {
      this.timeout(10000);
      hoodie.account.signIn('Hommer', '123')
        .fail(function (err) {
          assert.ok(false, err.message);
          done();
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
          assert.ok(false, err.message);
          done();
        })
        .then(function (task) {
          assert.ok((task.profile.userName ==='hommer'), 'getProfile');
          done();
        })
    });

    test('hommer should search a m term', function (done) {
      this.timeout(15000);
      hoodie.profile.search('m')
        .fail(function (err) {
          assert.ok(false, err.message);
          done();
        })
        .then(function (task) {
          done();
          assert.ok(task.profile.search.length === 4 , 'search ok');
        });
    });

    test('hommer should get by getUserId lisa', function (done) {
      this.timeout(15000);
      hoodie.profile.get(_.find(window.fixtures.users, { username: 'Lisa' }).hoodieId)
        .fail(function (err) {
          assert.ok(false, err.message);
          done();
        })
        .then(function (task) {
          done();
          assert.ok((task.profile.userName ==='lisa'), 'getProfile');
        });
    });

    test('hommer should get by userName lisa', function (done) {
      this.timeout(15000);
      hoodie.profile.getByUserName('lisa')
        .fail(function (err) {
          assert.ok(false, err.message);
          done();
        })
        .then(function (task) {
          done();
          assert.ok((task.profile.userName ==='lisa'), 'getProfile');
        });
    });

    test('hommer should update own profile', function (done) {
      this.timeout(10000);
      hoodie.profile.get()
        .fail(function (err) {
          assert.ok(false, err.message);
          done();
        })
        .then(function (_task) {
          var profile = _task.profile;
          profile.First_Name = 'Hommer';
          profile.Last_Name = 'Simpson';
          hoodie.profile.set(profile)
            .fail(function (err) {
              assert.ok(false, err.message);
              done();
            })
            .then(function () { return hoodie.profile.get(); })
            .then(function (task) {
              assert.ok((task.profile.Last_Name ==='Simpson'), 'getProfile');
              done();
            });
        })
    });

  });

});
