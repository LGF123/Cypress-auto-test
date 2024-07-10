describe('Sign in', () => {
    function createEmailFromTimestamp() {
        const currentTimestamp = new Date().getTime();
        const emailAddress = `${currentTimestamp}@dsers.com`;
        return emailAddress;
    }
    const email = createEmailFromTimestamp();
    const password = 'Lgf123456789!';

    it('passes', () => {
        cy.visit('https://accounts.dsers.com/accounts/register');
        cy.intercept('POST', '**/account-user-bff/v1/users/register').as('registerRequest');
        cy.get('#register_registerEM').focus().type(email);
        cy.get('#register_registerPs').focus().type(password);
        // 注册账号
        cy.get('.ant-btn').click();
        cy.wait('@registerRequest').its('response.statusCode').should('equal', 200);
    });

    afterEach(function () {
        // 如果测试失败，发送请求到飞书
        const testTitle = '注册账号'
        cy.sendErrorMessage(testTitle);
    });
});
