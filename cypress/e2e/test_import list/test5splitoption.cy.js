describe('Split option', () => {
    const useremail = 'guofeng.liu@dserspro.com';
    const userpassword = 'DSers#9Pa$$w0';
    const product_url = 'https://www.aliexpress.us/item/3256806027225550.html';

    beforeEach(() => {
        // 登录并导航到目标页面
        cy.login(useremail,userpassword);
        // 进入到import list 页面
        cy.visit('https://www.dsers.com/application/import_list');
        cy.get('.ant-input').focus().clear().type(product_url);
        // 导品
        cy.get('.index_suffixContainer__uLIj5 > .ant-btn').click();
    });

    it('passes', () => {
        // 监听拆分接口
        cy.intercept('POST', '**/split-option').as('splitoptionRequest');
        // 点击拆分商品按钮
        cy.get('.sc_below_toolbarRibbon').find('svg').eq(1).click()
        // 选择option 进行拆分商品
        cy.get('.index_byOption__65rOs > .index_title__q8TGA > .ant-radio-wrapper').click()
        // 选择第一个option 进行拆分商品
        cy.get('.index_byOption__65rOs').find('input[value="Color"]').click();
        // 点击确认按钮
        cy.get('.ant-drawer-footer > .ant-btn-default').click()
        cy.get('.ant-modal-footer > .ant-btn').click()
        // 断言拆分接口是否为200
        cy.wait('@splitoptionRequest').its('response.statusCode').should('equal', 200);
        cy.newclearImportList()

    });

    afterEach(function () { 
        // 如果测试失败，发送请求到飞书
        const testTitle = '根据option 拆分商品'
        cy.sendErrorMessage(testTitle);
        // // 清除import list测试数据
        // cy.clearImportList(product_url)
    });
});
