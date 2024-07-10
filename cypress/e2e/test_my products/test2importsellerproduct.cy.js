describe('Import seller product', () => {
    const useremail = 'guofeng.liu@dserspro.com';
    const userpassword = 'DSers#9Pa$$w0';
    const productname = 'test product';
    const shopifyappid = '1592406852827308032'

    beforeEach(() => {
        // 登录并导航到目标页面
        cy.login(useremail,userpassword);
        cy.updatePlatform(shopifyappid)
        cy.visit('https://www.dsers.com/application/my_products');
    });

    it('passes', () => {
        // 监听导入接口
        cy.intercept('POST', '**/my-product/pull').as('ImportsellerRequest');
        // 打开导入销端商品弹窗
        cy.get('.ant-tabs-extra-content > .ant-btn').click();
        // 输入需要导入的商品名称
        cy.get('input[placeholder="Find products..."]').clear().type(productname);
        // 点击搜索按钮
        cy.wait(3000);
        cy.get('.ant-input-group-addon > .ant-btn').click();
        // 点击导入按钮
        cy.wait(3000);
        cy.get('.index_bottom__6CgJT > div > .ant-checkbox-wrapper').click();
        cy.get('.index_bottom__6CgJT > .ant-btn > span').click()
        // 如果导入接口不是200，就发飞书消息
        cy.wait('@ImportsellerRequest').its('response.statusCode').should('equal', 200);
    });

    afterEach(function() {
        // 如果测试失败，发送请求到飞书
        const testTitle = '导入销端商品'
        cy.sendErrorMessage(testTitle);
        // 清除my products 测试数据
        cy.intercept('DELETE', '**/my-product**').as('deletemyProduct');
        cy.get('.ant-modal-close-x').click();
        // 等待10秒之后刷新页面
        cy.wait(10000);
        cy.reload();
        // 搜索商品进行删除
        cy.get('.index_searchbtn__p6FG8 > .ant-btn').click()
        cy.get('input[placeholder="Search My product here"]').clear().type(productname)
        cy.get('.ant-input-suffix > .ant-btn').click()
        // 点击全选复选框
        cy.get(':nth-child(1) > .ant-spin-nested-loading > .ant-spin-container > .ant-col > .ant-list-item > .shopping_card > .sc_above > .ant-checkbox-wrapper > .ant-checkbox > .ant-checkbox-input').click();
        // 删除按钮
        cy.get('.index_rightRibbon__rZSz5 > :nth-child(3) > [style="user-select: all; position: relative;"] > .ant-btn > span').click();   
        // 输入确认删除
        cy.get('.index_input_confirm__hx3I6 > .ant-input').clear().type('confirm');
        // 点击删除按钮
        cy.get('.ant-modal-footer > .ant-btn-default').click();
        cy.wait('@deletemyProduct').then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
        });
    });
});
