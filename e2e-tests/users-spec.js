var db = require('../db/mongo-dao');

'use strict';
//*******************NOTES*******************
// browser.driver.whatever is how you use the native web driver when angular is not involved.
// element(by.model('todoList.todoText')).sendKeys('write a protractor test') is how you do it if angular is involved;
// To Try: expect(loginNameInputElm.isPresent()).toBeTruthy();
//*******************NOTES*******************


describe('Creating an account', function() {
    var fakeUser = {
        "firstName": "fakeFirst",
        "lastName": "fakeLast",
        "email": "fake@gividen.com",
        "password": "netsmart"
    };
    db.removeUser({email: fakeUser.email}, function(err){
        console.log(err);
    });
    it('should add the user to the db and log them in', function () {
        //browser.driver.get('http://localhost:3000/users/create');
        //browser.driver.findElement(by.id('firstName')).sendKeys(fakeUser.firstName);
        //browser.driver.findElement(by.id('lastName')).sendKeys(fakeUser.lastName);
        //browser.driver.findElement(by.id('email')).sendKeys(fakeUser.email);
        //browser.driver.findElement(by.id('password')).sendKeys(fakeUser.password);
        //browser.driver.findElement(by.id('confirmPassword')).sendKeys(fakeUser.password);
        //browser.driver.findElement(by.id('createAccountBtn')).click();
        db.findUser({email: fakeUser.email}, function(err, user){
            if (err) {
                return err;
            }

            console.log(user);
            expect(user.email).toEqual(fakeUser.email);
        });
        //expect(browser.driver.getTitle()).toEqual('Main - Vote To Eat');
    });

    xit('should check if the account already exists', function () {
        //First user
        browser.driver.get('http://localhost:3000/users/create');
        browser.driver.findElement(by.id('firstName')).sendKeys("fakeFirst");
        browser.driver.findElement(by.id('lastName')).sendKeys("fakeLast");
        browser.driver.findElement(by.id('email')).sendKeys("fake@gividen.com");
        browser.driver.findElement(by.id('password')).sendKeys("netsmart");
        browser.driver.findElement(by.id('confirmPassword')).sendKeys("netsmart");
        browser.driver.findElement(by.id('createAccountBtn')).click();
        browser.driver.get('http://localhost:3000/users/logout');

        //Second duplicate user
        browser.driver.get('http://localhost:3000/users/create');
        browser.driver.findElement(by.id('firstName')).sendKeys("fakeFirst");
        browser.driver.findElement(by.id('lastName')).sendKeys("fakeLast");
        browser.driver.findElement(by.id('email')).sendKeys("fake@gividen.com");
        browser.driver.findElement(by.id('password')).sendKeys("netsmart");
        browser.driver.findElement(by.id('confirmPassword')).sendKeys("netsmart");
        browser.driver.findElement(by.id('createAccountBtn')).click();
        expect(browser.driver.findElement(by.id('error'))).toEqual('User already exists');
    });
});