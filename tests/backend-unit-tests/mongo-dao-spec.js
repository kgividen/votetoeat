'use strict';
console.log("**** (Backend Unit Testing [MOCHA]: 'mongo-dao-spec') ****");

var db = require('../../db/mongo-dao');
var expect = require('chai').expect;

describe("Mongo Dao", function() {
    describe('Group Tests', function() {
        var fakeGroupName = "FAKEGROUP";
        var fakeGroup = {
            name: fakeGroupName
        };
        beforeEach(function(done) {
            db.removeGroup(fakeGroupName, function (err, data) {
                done();
            });
        }, 5000);

        afterEach(function(done) {
            //cleanup fake group
            db.removeGroup(fakeGroupName, function (err, data) {
                done();
            });
        }, 5000);

        it('should be able to add and find a group in the database', function (done) {
            db.addGroup(fakeGroup, function (err, groups) {
                db.findGroup(fakeGroupName, function (err, group) {
                    expect(group).to.exist;
                    expect(group.name).equal(fakeGroupName);
                    done();
                });
            });
        });

        it('should be able to update a group', function (done) {
            db.addGroup(fakeGroup, function (err, groups) {
                fakeGroup.fakeAttr = "blah";
                db.updateGroup(fakeGroup, function(err, object){
                    db.findGroup(fakeGroupName, function (err, group) {
                        expect(group).to.exist;
                        expect(group.name).equal(fakeGroupName);
                        expect(group.fakeAttr).equal("blah");
                        done();
                    });
                });
            });
        });

        it('should be able to remove a group from the database', function (done) {
            db.addGroup(fakeGroup, function (err, group) {
                db.findGroup(fakeGroupName, function (err, group) {
                    expect(group).to.exist;
                    expect(group.name).equal(fakeGroupName);
                    db.removeGroup(fakeGroupName, function (err, group) {
                        db.findGroup(fakeGroupName, function (err, group) {
                            try{
                                expect(group).to.be.null;
                                done();
                            } catch (e) {
                                done(e);
                            }
                        });
                    });
                });
            });
        });
    });

    describe('PlacesTests', function() {
        var fakeGroupName = "fakegroupname";
        var place = {
            "name": "fakePlace1",
            "group": fakeGroupName,
            "addedBy": "fakeUser1",
            "url": "http://fakeUrl",
            "voters": []
        };
        var place2 = {
            "name": "fakePlace2",
            "group": fakeGroupName,
            "addedBy": "fakeUser1",
            "url": "http://fakeUrl2",
            "voters": []
        };

        var place3 = {
            "name": "fakePlace3",
            "group": "otherGroup",
            "addedBy": "fakeUser1",
            "url": "http://fakeUrl3",
            "voters": []
        };
        beforeEach(function (done) {
            db.removePlace(place.name, function (err, data) {
                db.removePlace(place2.name, function (err, data) {
                    db.removePlace(place3.name, function (err, data) {
                        done();
                    });
                });
            });
        }, 5000);

        afterEach(function (done) {
            db.removePlace(place.name, function (err, data) {
                db.removePlace(place2.name, function (err, data) {
                    db.removePlace(place3.name, function (err, data) {
                        done();
                    });
                });
            });
        }, 5000);

        it('should be able to add and find a place', function (done) {
            db.addUpdatePlace(place, function (err, object) {
                db.findPlace(place, function (err, found) {
                    expect(found).to.exist;
                    expect(found.name).equal(place.name);
                    expect(found.group).equal(place.group);
                    done();
                });
            });
        });

        it('should be able to find places by group', function (done) {
            db.addUpdatePlace(place, function (err, object) {
                db.addUpdatePlace(place2, function (err, object) {
                    db.addUpdatePlace(place3, function (err, object) {
                        db.findPlacesByGroup(fakeGroupName, function (err, places) {
                            expect(places).to.exist;
                            expect(places[0].name).equal("fakePlace1");
                            expect(places[1].name).equal("fakePlace2");
                            expect(places[2]).to.be.undefined;
                            done();
                        });
                    });
                });
            });
        });

        it('should be able to remove a place from the database', function (done) {
            db.addUpdatePlace(place, function (err, object) {
                db.findPlace(place, function (err, f1) {
                    expect(f1).to.exist;
                    db.removePlace(place.name, function (err) {
                        db.findPlace(place, function (err, f2) {
                            try{
                                expect(f2).to.be.null;
                                done();
                            } catch (e) {
                                done(e);
                            }
                        });
                    });
                });
            });
        });

        it('should be able to remove places by group from the database', function (done) {
            db.addUpdatePlace(place, function (err) {
                db.addUpdatePlace(place2, function (err) {
                    db.findPlace(place, function (err, p) {
                        expect(p).to.exist;
                        db.findPlace(place2, function (err, p2) {
                            expect(p2).to.exist;
                            db.removePlacesByGroup(fakeGroupName, function (err) {
                                db.findPlace(place, function (err, found) {
                                    try{
                                        expect(found).to.be.null;
                                        done();
                                    } catch (e) {
                                        done(e);
                                    }
                                });
                            });
                        });
                    });
                });
            });
        });

    });

    describe('ChatTests', function() {
        var fakeGroupName = "fakegroupname";
        var timeStamp = new Date().toLocaleTimeString();
        var fakeUserName = "fakeUserName";
        var fakeMsgText = "Here is some chat text";

        var fakeMsg = {
            type: "user",
            user: fakeUserName,
            timestamp: timeStamp,
            text: fakeMsgText,
            group: fakeGroupName
        };

        beforeEach(function (done) {
            db.removeChatByGroup(fakeGroupName, function (err) {
                done();
            });
        }, 5000);

        afterEach(function (done) {
            db.removeChatByGroup(fakeGroupName, function (err) {
                done();
            });
        }, 5000);

        it('should be able to add a chat and find them by group', function (done) {
            db.addUpdateChat(fakeMsg, function (err, object) {
                db.findChatsByGroup(fakeGroupName, function (err, found) {
                    expect(found).to.exist;
                    expect(found[0].user).equal(fakeUserName);
                    expect(found[0].text).equal(fakeMsgText);
                    expect(found[0].group).equal(fakeGroupName);
                    done();
                });
            });
        });

        it('should be able to remove a chat session from the database', function (done) {
            db.addUpdateChat(fakeMsg, function (err, object) {
                db.findChatsByGroup(fakeGroupName, function (err, found) {
                    expect(found).to.exist;
                    expect(found[0].user).equal(fakeUserName);
                    db.removeChatByGroup(fakeGroupName, function (err) {
                        db.findChatsByGroup(fakeGroupName, function (err, found) {
                            try{
                                expect(found).to.be.empty;
                                done();
                            } catch (e) {
                                done(e);
                            }
                        });
                    });
                });
            });
        });


    });

    describe('Group Members Tests', function() {
        var fakeGroupName = "fakegroupname";
        var member = {
            "name": "fakeMember1",
            "group": fakeGroupName,
        };

        var member2 = {
            "name": "fakeMember2",
            "group": fakeGroupName,
        };

        var member3 = {
            "name": "fakeMember3",
            "group": "otherGroup"
        };

        beforeEach(function (done) {
            db.removeMember(member, function (err, data) {
                db.removeMember(member2, function (err, data) {
                    db.removeMember(member3, function (err, data) {
                        done();
                    });
                });
            });
        }, 5000);

        afterEach(function (done) {
            db.removeMember(member, function (err, data) {
                db.removeMember(member2, function (err, data) {
                    db.removeMember(member3, function (err, data) {
                        done();
                    });
                });
            });
        }, 5000);

        it('should be able to add and find a member', function (done) {
            db.addUpdateMember(member, function (err, object) {
                db.findMember(member, function (err, found) {
                    expect(found).to.exist;
                    expect(found.name).equal(member.name);
                    done();
                });
            });
        });

        it('should be able to remove a member', function (done) {
            db.addUpdateMember(member, function (err, object) {
                db.findMember(member, function (err, found) {
                    expect(found).to.exist;
                    db.removeMember(member, function(err){
                       db.findMember(member, function(err, found){
                            try {
                                expect(found).to.be.null;
                                done();
                            } catch (e){
                                done(e);
                            }
                       });
                    });
                });
            });
        });

        it('should be able to find members by group', function (done) {
            db.addUpdateMember(member, function (err, object) {
                db.addUpdateMember(member2, function (err, object) {
                    db.addUpdateMember(member3, function (err, object) {
                        db.findMembersByGroup(fakeGroupName, function (err, members) {
                            expect(members).to.exist;
                            expect(members[0].name).equal(member.name);
                            expect(members[1].name).equal(member2.name);
                            expect(members[2]).to.be.undefined;
                            done();
                        });
                    });
                });
            });
        });

        it('should be able to remove members by group from the database', function (done) {
            db.addUpdateMember(member, function (err, object) {
                db.addUpdateMember(member2, function (err, object) {
                    db.addUpdateMember(member3, function (err, object) {
                        db.findMembersByGroup(fakeGroupName, function (err, members) {
                            expect(members).to.exist;
                            db.removeMembersByGroup(fakeGroupName, function (err, data) {
                                db.findMembersByGroup(fakeGroupName, function (err, members) {
                                    expect(members).to.be.empty;
                                    done();
                                })
                            });
                        });
                    });
                });
            });
        });
    });

    describe('User Tests', function() {
        var fakeUserName = "fakeUserName";
        var fakeUser = {
            name: fakeUserName
        };
        beforeEach(function(done) {
            db.removeUser(fakeUserName, function (err, data) {
                done();
            });
        }, 5000);

        afterEach(function(done) {
            //cleanup fake group
            db.removeUser(fakeUserName, function (err, data) {
                done();
            });
        }, 5000);
        it('should be able to add and find a user in the database', function (done) {
            db.addUser(fakeUser, function (err, users) {
                db.findUser(fakeUserName, function (err, user) {
                    expect(user).to.exist;
                    expect(user.name).equal(fakeUserName);
                    done();
                });
            });
        });

        it('should be able to remove a user from the database', function (done) {
            db.addUser(fakeUser, function (err, users) {
                db.findUser(fakeUserName, function (err, user) {
                    expect(user).to.exist;
                    expect(user.name).equal(fakeUserName);
                    db.removeUser(fakeUser, function (err, user) {
                        db.findUser(fakeUserName, function (err, user) {
                            try{
                                expect(user).to.be.undefined;
                                done();
                            } catch (e) {
                                done(e);
                            }
                        });
                    });
                });
            });
        });
    });

    describe('Combine Data Tests', function() {
        var fakeGroupName = "fakegroupname";
        var fakeUserName = "fakeUser1";
        var member = {
            "name": "fakeMember1",
            "group": fakeGroupName
        };

        var member2 = {
            "name": "fakeMember2",
            "group": fakeGroupName
        };

        var place = {
            "name": "fakePlace1",
            "group": fakeGroupName,
            "addedBy": fakeUserName,
            "url": "http://fakeUrl",
            "voters": []
        };

        var place2 = {
            "name": "fakePlace2",
            "group": fakeGroupName,
            "addedBy": "fakeUser2",
            "url": "http://fakeUrl",
            "voters": []
        };


        var fakeTimeStamp = new Date().toLocaleTimeString();
        var fakeMsgText = "Here is some chat text";
        var fakeMsg = {
            type: "user",
            user: fakeUserName,
            timestamp: fakeTimeStamp,
            text: fakeMsgText,
            group: fakeGroupName
        };

        beforeEach(function (done) {
            db.removeMember(member, function (err, data) {
                db.removeMember(member2, function (err, data) {
                    db.removePlace(place.name, function (err, data) {
                        db.removePlace(place2.name, function (err, data) {
                            db.removeChatByGroup(fakeGroupName, function (err, data) {
                                done();
                            });
                        });
                    });
                });
            });
        }, 5000);

        afterEach(function (done) {
            db.removeMember(member, function (err, data) {
                db.removeMember(member2, function (err, data) {
                    db.removePlace(place.name, function (err, data) {
                        db.removePlace(place2.name, function (err, data) {
                            db.removeChatByGroup(fakeGroupName, function (err, data) {
                                done();
                            });
                        });
                    });
                });
            });
        }, 5000);

        it('should be able to add and find a member', function (done) {
            db.addUpdateMember(member, function (err, object) {
                db.addUpdateMember(member2, function (err, object) {
                    db.addUpdatePlace(place, function (err, object) {
                        db.addUpdatePlace(place2, function (err, object) {
                            db.addUpdateChat(fakeMsg, function (err, object) {
                                db.findGroupAndAllAttrs(fakeGroupName, function (err, result) {
                                    try{
                                        expect(result).to.exist;
                                        expect(result.members).to.exist;
                                        expect(result.members[0].name).equal("fakeMember1");
                                        expect(result.members[1].name).equal("fakeMember2");
                                        expect(result.places).to.exist;
                                        expect(result.places[0].name).equal("fakePlace1");
                                        expect(result.places[1].name).equal("fakePlace2");
                                        expect(result.chatSession[0].text).equal(fakeMsg.text);
                                        expect(result.chatSession[0].user).equal(fakeUserName);
                                        done();
                                    } catch (e){
                                        done(e);
                                    }
                                })
                            });
                        });
                    });
                });
            });
        });

        it('should be able to delete all data by group', function (done) {
            db.addUpdateMember(member, function (err, object) {
                db.addUpdateMember(member2, function (err, object) {
                    db.addUpdatePlace(place, function (err, object) {
                        db.addUpdatePlace(place2, function (err, object) {
                            db.addUpdateChat(fakeMsg, function (err, object) {
                                db.findGroupAndAllAttrs(fakeGroupName, function (err, result) {
                                    try{
                                        expect(result).to.exist;
                                        expect(result.members).to.exist;
                                        expect(result.members[0].name).equal("fakeMember1");
                                        expect(result.members[1].name).equal("fakeMember2");
                                        expect(result.places).to.exist;
                                        expect(result.places[0].name).equal("fakePlace1");
                                        expect(result.places[1].name).equal("fakePlace2");
                                        expect(result.chatSession[0].text).equal(fakeMsg.text);
                                        expect(result.chatSession[0].user).equal(fakeUserName);
                                        db.removeGroupAndAllAttrs(fakeGroupName, function (err, result) {
                                            db.findGroupAndAllAttrs(fakeGroupName, function (err, result) {
                                                expect(result).to.exist;
                                                expect(result.members).to.be.empty;
                                                expect(result.places).to.be.empty;
                                                expect(result.chatSession).to.be.empty;
                                                done();
                                            });
                                        });
                                    } catch (e){
                                        done(e);
                                    }
                                });
                            });
                        });
                    });
                });
            });
        });
    });

});