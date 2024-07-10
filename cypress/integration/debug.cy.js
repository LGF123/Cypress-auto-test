describe('Import product', () => {
    const useremail = 'guofeng.liu@dserspro.com';
    const userpassword = 'qwer1234';
    const csvappid = '1656559960459997184'

    beforeEach(() => {
        // 登录并导航到目标页面
        cy.login(useremail, userpassword);
        cy.updatePlatform(csvappid)
        cy.visit('https://www.dsers.com/application/orders/159831080')
    });

    it('passes', () => {
        
        cy.visit('https://www.dsers.com/application/orders/159831080')
    });

    afterEach(() => {
       
        
    });
});