'use strict';

var db = require('../db/mongo-dao');


describe("Mongo Dao", function() {
    var fakeUser = {
        "firstName": "fakeFirst1",
        "lastName": "fakeLast1",
        "email": "fake1@gividen.com",
        "password": "netsmart"
    };

    var fakeGroup = {
        "name": "fakeGroup",
        "members": [],
        "places": []
    };


    beforeEach(function(done) {
        //cleanup fake user
        db.removeUser(fakeUser, function (err, data) {
            if (err) console.log(err);
            done();

        });

        //cleanup fake group
        db.removeGroup(fakeGroup, function (err, data) {
            if (err) console.log(err);
            done();

        });
    }, 5000);

    afterEach(function(done) {
        //cleanup fake user and group
        db.removeUser(fakeUser, function (err, data) {
            if (err) console.log(err);
            done();

        });

        db.removeGroup(fakeGroup, function (err, data) {
            if (err) console.log(err);
            done();

        });
    }, 5000);


    it('should be able to add a user and then remove it', function (done) {
        var returnedUser;

        db.addUser(fakeUser, function(err, users){
            returnedUser = users[0];
            expect(returnedUser.email).toEqual(fakeUser.email);
            expect(returnedUser.firstName).toEqual(fakeUser.firstName);
            expect(returnedUser.lastName).toEqual(fakeUser.lastName);
            done(); //need this for async so it won't do the expects until the call returns
            db.removeUser(fakeUser, function (err, data) {
                if (err) console.log(err);
                done();
                db.findUser(fakeUser, function(err, user){
                    expect(user).toBeFalsy();
                    done();
                });
            });
        });
    });

    it('should be able to find a user', function (done) {
        var returnedUser;

        db.addUser(fakeUser, function(err, users){
            returnedUser = users[0];
            expect(returnedUser.email).toEqual(fakeUser.email);
            expect(returnedUser.firstName).toEqual(fakeUser.firstName);
            expect(returnedUser.lastName).toEqual(fakeUser.lastName);
            done(); //need this for async so it won't do the expects until the call returns

            db.findUser(fakeUser, function(err, user){
                var returnedUser = user;
                expect(user).toBeTruthy();
                expect(returnedUser.email).toEqual(fakeUser.email);
                expect(returnedUser.firstName).toEqual(fakeUser.firstName);
                expect(returnedUser.lastName).toEqual(fakeUser.lastName);
                done();
            });
        });
    });

    it('should be able to add a group and then remove it', function (done) {
        var returnedGroup;
        db.addGroup(fakeGroup, function(err, group){
            returnedGroup = group;
            db.findGroup(fakeGroup, function(err, fgroup){
                var returnedGroup = fgroup;
                expect(returnedGroup).toBeTruthy();
                expect(returnedGroup.name).toEqual(fakeGroup.name);
                done();
            });
        });
    });
});

//******************NOTES*******************
