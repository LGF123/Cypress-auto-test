describe('Push product', () => {
    const useremail = 'guofeng.liu@dserspro.com';
    const userpassword = 'DSers#9Pa$$w0';
    const product_url ='https://www.aliexpress.us/item/3256806027225550.html'
    beforeEach(() => {
        // 登录并导航到目标页面
        cy.login(useremail,userpassword);
        cy.visit('https://www.dsers.com/application/import_list');
        // 导入一个测试商品
        cy.get('.ant-input').focus().clear().type(product_url);
        // 导品
        cy.get('.index_suffixContainer__uLIj5 > .ant-btn').click();
    });
    it('passes', () => {
        // 选择import list 页面的第一个商品的复选框
        cy.get(':nth-child(1) > .ant-col > .ant-list-item > .ant-spin-nested-loading > .ant-spin-container > .shopping_card > .sc_above > .ant-checkbox-wrapper > .ant-checkbox > .ant-checkbox-input').click();
        // 点击push 按钮，唤起push 弹窗
        cy.get('.index_leftRibbon__T3Tgy > div > .ant-btn').click();
        // push 弹窗里面选择第一销端个店铺
        // cy.get('.index_storesContainer__s4UP2 > .ant-checkbox-group > :nth-child(1)').click();
        // 在push 弹窗点击push 按钮
        cy.get('.ant-modal-footer > .ant-btn').click()
        cy.get('.index_import__8BlIc > span').should('be.visible').then(($element) => {
            if (!$element.is(':visible')) {
                cy.screenshot()
                .then(() => {
                    cy.request({
                        method: 'post',
                        url: 'https://open.feishu.cn/open-apis/bot/v2/hook/f94806ce-8dc3-47a6-bd96-d94662f468c5',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: {
                            "msg_type": "text",
                            "content": {
                              "text": `用例名称:推送商品\n\n用户邮箱:${useremail}\n\n推送失败;推送商品的URL: ${product_url}`,
                            //   "image": screenshotData
                            }
                        }
                    });
                });
            }
        });
        cy.newclearImportList()
    });
    afterEach(() => {
        // 如果测试失败，发送请求到飞书
        const testTitle = '推送商品'
        cy.sendErrorMessage(testTitle); 
        // // 清除import list测试数据
        // cy.get('.ant-modal-close-x').click()
        });
    });