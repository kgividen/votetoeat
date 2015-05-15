'use strict';
//*******************NOTES*******************
//
// browser.driver.whatever is how you use the native web driver when angular is not involved.
// element(by.model('todoList.todoText')).sendKeys('write a protractor test') is how you do it if angular is involved;
// To Try: expect(loginNameInputElm.isPresent()).toBeTruthy();
//*******************NOTES*******************

//describe('VoteToEat Index Page', function() {
//    it('should have a title', function () {
//        browser.driver.get('http://localhost:3000');
//        expect(browser.driver.getTitle()).toEqual('Login - Vote To Eat');
//    });
//
//    it('should have the header', function () {
//        browser.driver.get('http://localhost:3000');
//        expect(browser.driver.findElement(by.tagName('h1')).getText()).toEqual('Vote To Eat!');
//    });
//
//    it('should have a login button', function () {
//        browser.driver.get('http://localhost:3000');
//        expect(browser.driver.findElement(by.id('submit-login')).getAttribute('value')).toMatch('Log in');
//    });
//});


//describe('Login in and out of Vote to eat', function() {
//    it('should change the page and then logout', function () {
//        browser.driver.get('http://localhost:3000');
//        browser.driver.findElement(by.id('email')).sendKeys('register@gividen.com');
//        browser.driver.findElement(by.id('password')).sendKeys('xabler');
//        browser.driver.findElement(by.id('submit-login')).click();
//        expect(browser.driver.findElement(by.tagName('h1')).getText()).toEqual('Hello Kent!');
//        browser.driver.findElement(by.id('logoutBtn')).click();
//        expect(browser.driver.findElement(by.id('submit-login')).getAttribute('value')).toMatch('Log in');
//    });
//});

describe('Main Page', function() {
    it('should display welcome message with the first name', function () {
        browser.get('/main');
        expect(element(by.binding('userName')).getText()).toEqual('Hello Kent!');
    });

    it('should create group button and join button', function () {
        browser.get('/main');

        //HERE IS AN EXAMPLE OF HOW TO GET MULTIPLE ITEMS
        //var todoList = element.all(by.repeater('todo in todoList.todos'));
        //expect(todoList.count()).toEqual(3);
        //expect(todoList.get(2).getText()).toEqual('write a protractor test');
        //
        //
        element.all(by.css('.btn')).then(function(elements) {
            var createGroup = elements[0];
            var joinGroup = elements[1];
            expect(createGroup.getText()).toEqual("Create Group »");
            expect(joinGroup.getText()).toEqual("Join Group »");
        });
    });

    it('should open create group modal when create group button is clicked', function () {
        element.all(by.css('.btn')).then(function(elements) {
            var createGroup = elements[0];
            createGroup.click();
            expect(element(by.model('groupName')).isPresent()).toBe(true);

        });
    })
});
