describe('Edit order address', () => {
    const useremail = 'guofeng.liu@dserspro.com';
    const userpassword = 'DSers#9Pa$$w0';
    const csvappid = '1656559960459997184';
    const contact_name = 'liu guofengtest';
    const tel = '00000000000';
    const country = 'Uruguay';
    const province = 'testprovince';
    const city = 'testcity';
    const address1 = 'testupdate add1';
    const address2 = 'testupdate add2'
    const zip = '12345'

    beforeEach(() => {
        // 生成CSV 上传文件的数据
        cy.task('modifyExcel');
        // 登录并导航到目标页面
        cy.login(useremail, userpassword);
        cy.updatePlatform(csvappid)
    });

    it('action edit 订单', () => {
        // 调用创建订单数据函数
        cy.createOrder()
        // 监听订单列表接口
        cy.intercept('POST', '**/dsers-order-bff/v1/search-orders').as('searchOrders'); 
        // 点击展开编辑地址信息
        cy.get('.index_expendAdd__SFEAv > :nth-child(1)').click()
        cy.wait(3000)
        // 监听更新订单地址信息接口
        cy.intercept('POST', '**/dsers-order-bff/v1/update-order-address').as('orderUpdateadd');
        // 国家更新为当前国家的下一个国家
        cy.get('#countryCode > .ant-select > .ant-select-selector > .ant-select-selection-item').click().type('{downarrow}{downarrow}{enter}')
        cy.wait(3000)
        // contact name更新为liu guofengtest
        cy.get(':nth-child(1) > .ant-form-item > .ant-row > .ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .index_uniteInput__uVFQZ > .ant-input').focus().clear().type(contact_name)
        // 手机号更新为00000000000
        cy.get(':nth-child(3) > .ant-form-item > .ant-row > .ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .index_uniteInput__uVFQZ > .ant-input').focus().clear().type(tel)
        // Address 1更新为testupdate add1
        cy.get(':nth-child(4) > .ant-form-item > .ant-row > .ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .index_uniteInput__uVFQZ > .ant-input').focus().clear().type(address1)
        // Address 2更新为testupdate add2
        cy.get(':nth-child(6) > .ant-form-item > .ant-row > .ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .index_uniteInput__uVFQZ > .ant-input').focus().clear().type(address2)
        // 省份更新为testprovince
        cy.get(':nth-child(8) > .ant-form-item > .ant-row > .ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .index_uniteInput__uVFQZ > .ant-input').focus().clear().type(province)
        // 城市更新为testcity
        cy.get(':nth-child(9) > .ant-form-item > .ant-row > .ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .index_uniteInput__uVFQZ > .ant-input').focus().clear().type(city)
        // zip 更新为12345
        cy.get(':nth-child(10) > .ant-form-item > .ant-row > .ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .index_uniteInput__uVFQZ > .ant-input').clear().focus().type(zip)
        // 点击保存地址信息按钮
        cy.get('.index_addressFooter__4Sh5W > .ant-btn-default').click()
        cy.wait('@orderUpdateadd').then((interception)=>{
            expect(interception.response.statusCode).to.equal(200);
            const reqboby = interception.request.body;
            const update_add = reqboby.address
            expect(update_add.address1).to.equal(address1);
            expect(update_add.address2).to.equal(address2);
            expect(update_add.city).to.equal(city);
            expect(update_add.contactName).to.equal(contact_name);
            expect(update_add.country).to.equal(country);
            expect(update_add.province).to.equal(province);
            expect(update_add.tel).to.equal(tel);
            expect(update_add.zip).to.equal(zip);
        })
        // fulfill awaiting order 中的订单，清除测试数据
        cy.wait('@searchOrders').then((interception)=> {
            const response = interception.response.body;
            const orders = response.orders;
            orders.forEach((order) => {
                const orderId = order.id;
                const lineItemIds = order.items.map((item) => item.id);
                cy.fulfillOrder(orderId,lineItemIds)
            });
        })
    
    });

    afterEach(() => {
         // 如果测试失败，发送请求到飞书
         const testTitle = '编辑订单地址信息'
         cy.sendErrorMessage(testTitle);
    });
});
