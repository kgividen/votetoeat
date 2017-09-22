'use strict';
console.log("**** (Backend Unit Testing [MOCHA]: '(REST api-spec') ****");


var fs = require('fs');
var app = require('../../app');
var chai = require("chai");
var chaiHttp = require('chai-http');
var expect = require("chai").expect;
var should = require("chai").should();
var nock = require("nock");
var db = require('../../db/mongo-dao');

chai.use(chaiHttp);
// passportStub.install(app);

describe("REST API Tests", function () {
    var fakeGroupName = "fakeGroupName";
    var fakeGroup = {
        name: fakeGroupName
    };

    if (process.env.NODE_ENV == 'production') {
        return;
    }

    function cleanup(done){
        db.removeGroup(fakeGroupName, function(){
            done();
        });
    }
    beforeEach(function (done) {
        cleanup(done);
    }, 5000);

    afterEach(function (done) {
        // cleanup fake repo
        cleanup(done);
    }, 5000);

    it('should get a pong on /ping GET', function (done) {
        chai.request(app)
            .get('/api/ping')
            .end(function (err, res) {
                res.should.have.status(200);
                done();
            });
    });

    it('should get a group on /group/:groupName GET', function (done) {
        db.addGroup(fakeGroup, function(err, result){
            chai.request(app)
                .get('/api/group/' + fakeGroupName)
                .end(function (err, res) {
                    res.should.have.status(200);
                    expect(res.body.name).to.be.eql(fakeGroup.name);
                    done();
                });
        });
    });

    it('should create a group on /group POST', function (done) {
        chai.request(app)
            .post('/api/group/')
            .send(fakeGroup)
            .end(function (err, res) {
                res.should.have.status(200);
                db.findGroup(fakeGroupName, function (err, result) {
                    expect(result.name).to.be.eql(fakeGroup.name);
                    done();
                });
            });
    });

});