describe('Import product', () => {
    const useremail = 'guofeng.liu@dserspro.com';
    const userpassword = 'DSers#9Pa$$w0';
    const product_url = 'https://www.aliexpress.us/item/3256806027225550.html';

    beforeEach(() => {
        // 登录并导航到目标页面
        cy.login(useremail, userpassword);
        cy.visit('https://www.dsers.com/application/import_list');
    });

    it('passes', () => {
        // 监听导入接口
        cy.intercept('POST', '**/dsers-product-bff/import-list/product-id').as('ImportRequest');
        // 输入AE 商品URL
        cy.get('.ant-input').focus().clear().type(product_url);
        // 导品
        cy.get('.index_suffixContainer__uLIj5 > .ant-btn').click();
        cy.wait('@ImportRequest').its('response.statusCode').should('equal', 200);
        cy.newclearImportList()
       
    });

    afterEach(() => {
        // 如果测试失败，发送请求到飞书
        const testTitle = '导入供端商品';
        cy.sendErrorMessage(testTitle);
        
    });
});