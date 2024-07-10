describe('Place order', () => {
    const useremail = 'guofeng.liu@dserspro.com';
    const userpassword = 'DSers#9Pa$$w0';
    const csvappid = '1656559960459997184'

    beforeEach(() => {
        // 生成CSV 上传文件的数据
        cy.task('modifyExcel');
        // 登录并导航到目标页面
        cy.login(useremail, userpassword);
        cy.updatePlatform(csvappid)
    });

    it('csv 上传文件自动下单', () => {
        // 调用创建订单数据函数
        cy.createOrder()
        // 勾选订单
        // cy.get('.index_OrderTitle__f\+Hca > .ant-checkbox-wrapper > .ant-checkbox > .ant-checkbox-input').click()
        // 点击下单按钮
        cy.get(':nth-child(1) > .ant-spin-container > .index_OrderWhole__eYOHT > .index_OrderWholeFooter__vBB8A > .ant-btn > div').click()
        // 点击下单弹窗中的下单按钮
        cy.get('.index_orderModalFooter__pjsMu > .ant-btn').click()
        // 调用检查下单结果的函数
        cy.waitForOrderPlacement()
    
    });

    afterEach(() => {
         // 如果测试失败，发送请求到飞书
         const testTitle = 'csv 上传文件自动下单'
         cy.sendErrorMessage(testTitle);
    });
});
