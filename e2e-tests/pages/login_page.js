var LoginPage = function() {
    this.emailInput = element(by.id('email'));
    this.password = element(by.id('password'));

    this.get = function() {
        browser.get('http://localhost:3000');
    };

    this.fillEmail = function(name) {
        this.emailInput.sendKeys(name);
    };

    this.fillPassword = function(pwd) {
        this.emailInput.sendKeys(pwd);
    };

    this.login = function() {
        browser.driver.get('http://localhost:3000');
        browser.driver.findElement(by.id('email')).sendKeys('register@gividen.com');
        browser.driver.findElement(by.id('password')).sendKeys('xabler');
        browser.driver.findElement(by.id('submit-login')).click();
    }
};