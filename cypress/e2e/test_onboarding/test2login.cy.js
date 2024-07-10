describe('Log in', () => {
    const email = 'guofeng.liu@dserspro.com';
    const password = 'DSers#9Pa$$w0';
    it('passes', () => {
        cy.visit('https://accounts.dsers.com/accounts/login');
        cy.intercept('POST', '**/account-user-bff/v1/users/login').as('loginRequest');
        cy.get('#login_email').focus().type(email);
        cy.get('#login_password').focus().type(password);
        // 登录账号
        cy.get('.ant-btn > span').click();
        cy.wait('@loginRequest').its('response.statusCode').should('equal', 200);
    });

    afterEach(function () {
        // 如果测试失败，发送请求到飞书
        const testTitle = '登录账号'
        cy.sendErrorMessage(testTitle);
    });
});
