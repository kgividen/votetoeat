exports.config = {
    allScriptsTimeout: 11000,

    specs: [
        '*.js'
    ],

    capabilities: {
        'browserName': 'chrome'
    },

    //WARNING: You cannot debug if you are running multiple browser instances.
    //multiCapabilities: [{
    //    browserName: 'firefox'
    //}, {
    //    browserName: 'chrome'
    //}],

    baseUrl: 'http://localhost:3000',

    //This logs a user in each time before running the tests.
    onPrepare: function () {
        browser.driver.get('http://localhost:3000');
        browser.driver.findElement(by.id('email')).sendKeys('register@gividen.com');
        browser.driver.findElement(by.id('password')).sendKeys('xabler');
        browser.driver.findElement(by.id('submit-login')).click();
        //expect(browser.driver.findElement(by.tagName('h1')).getText()).toEqual('Hello Kent!');
        //browser.driver.findElement(by.id('logoutBtn')).click();
        //expect(browser.driver.findElement(by.id('submit-login')).getAttribute('value')).toMatch('Log in');

        return browser.driver.wait(function() {
            return browser.driver.getCurrentUrl().then(function(url) {
                return /main/.test(url);
            });
        }, 8000);

    },

    framework: 'jasmine',

    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000
    }
};