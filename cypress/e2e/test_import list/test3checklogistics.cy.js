describe('Check logistics', () => {
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
        // 监听编辑接口
        cy.intercept('GET', '**/freight**').as('checklogisticsRequest');
        // 点击编辑商品按钮
        cy.get('.sc_below_toolbarRibbon >:nth-child(1)>svg').click();
        // 进入shipping info页面
        cy.get('[data-node-key="Shipping info"]').click();
        // 输入美国进行搜索
        cy.get('.SetShipping_search_box__qxEZ1 > .ant-input').type('United States')
        cy.get('.SetShipping_btn_cs__lfo9g').click()
        cy.contains('li > p', 'United States').click();
        // 断言接口是否为200，并且response 中的data 不为空
        cy.wait('@checklogisticsRequest').then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
            expect(interception.response.body.data).to.not.be.empty;
        });
        cy.newclearImportList()
        
    });

    afterEach(function () {
        // 如果测试失败，发送请求到飞书
        const testTitle = '查看物流信息'
        cy.sendErrorMessage(testTitle);
        // // 清除import list测试数据
        // cy.get('.ant-drawer-close').click()
        // cy.clearImportList(product_url)
    });
});
