describe('Search product', () => {
    const useremail = 'guofeng.liu@dserspro.com';
    const userpassword = 'DSers#9Pa$$w0';
    const shopifyappid = '1592406852827308032'
    beforeEach(() => {
        // 登录并导航到目标页面
        cy.login(useremail,userpassword);
        cy.updatePlatform(shopifyappid)
        cy.visit('https://www.dsers.com/application/my_products');
    });

    it('passes', () => {
        cy.intercept('GET', '**/dsers-product-bff/my-product/seller**').as('SearchRequest');
        cy.get('.ant-tabs-extra-content > .ant-btn').click();
        cy.wait('@SearchRequest').its('response.statusCode').should('equal', 200);
    });

    afterEach(function () {
        // 如果测试失败，发送请求到飞书
        const testTitle = '搜索销端商品'
        cy.sendErrorMessage(testTitle);
    });
});
