// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
// commands.js
// cypress/support/commands.js
// 在 cypress/support/commands.js 中更新自定义命令
import 'cypress-file-upload';
let csvauthorization;
// 封装发送飞书消息的请求
Cypress.Commands.add("sendErrorMessage", (testTitle) => {
    // 如果测试失败，发送请求到飞书
    if (Cypress.mocha.getRunner().failures) {
        const currentTest = testTitle;
        const errorMessage = Cypress.mocha.getRunner().test.err.message;
        const stackTrace = Cypress.mocha.getRunner().test.err.stack;
        let errorType = '未知错误类型';

        // 根据错误信息判断错误类型
        if (errorMessage.includes('Timed out retrying after 30000ms') || errorMessage.includes('could not be found')) {
            errorType = '元素定位失败';
        } else if (errorMessage.includes('expected')) {
            errorType = '断言失败';
        }
        cy.request({
            method: 'POST',
            // url: 'https://open.feishu.cn/open-apis/bot/v2/hook/f94806ce-8dc3-47a6-bd96-d94662f468c5',
            url: 'https://open.feishu.cn/open-apis/bot/v2/hook/ae6801a4-b568-4ddc-9ad8-b6636cf9b01c',
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                "msg_type": "text",
                "content": {
                    "text": `用例名称: ${currentTest}\n\n测试失败类型: ${errorType}\n\n错误信息: ${errorMessage}\n\n报错内容: ${stackTrace}`
                }
            }
        });
    }
});

// 封装重置密码之后登录账号
Cypress.Commands.add("resetLogin", (email, password) => {
    cy.intercept('POST', '**account-user-bff/v1/users/session/auto/login', (req) => {
        csvauthorization = req.headers['authorization']; 
    }).as('loginRequest');
    cy.visit('https://accounts.dsers.com/accounts/login');
    cy.get('#login_email').focus().type(email);
    cy.get('#login_password').focus().type(password);
    cy.get('.ant-btn > span').click();
    cy.wait('@loginRequest').its('response.statusCode').should('equal', 200);
});

// 封装登录账号
Cypress.Commands.add("login", (email, password) => {
    cy.intercept('POST', '**account-user-bff/v1/users/session/auto/login', (req) => {
        csvauthorization = req.headers['authorization']; 
    }).as('loginRequest');
    cy.visit('https://accounts.dsers.com/accounts/login');
    cy.get('#login_email').focus().type(email);
    cy.get('#login_password').focus().type(password);
    cy.get('.ant-btn > span').click();
    cy.get('img[src="https://img.dsers.com/shopify/order/close.png"]', { failOnStatusCode: false }).then(($element) => {
        if ($element.length > 0) {
            cy.wrap($element).click();
        }
    });
});

// 封装删除import list 里面的数据
Cypress.Commands.add('clearImportList', (productUrl) => {
        cy.intercept('DELETE', '**/import-list/**').as('deleteProduct');
        cy.get('.ant-input-affix-wrapper').type(productUrl);
        cy.get('.index_suffixContainer__uLIj5 > .ant-btn').click();
        cy.get('.index_leftRibbon__T3Tgy > .ant-checkbox-wrapper > .ant-checkbox > .ant-checkbox-input').click({ force: true });
        cy.get('.index_rightRibbon__rZSz5 > :nth-child(3) > [style="user-select: all; position: relative;"] > .ant-btn').click({ force: true });
        cy.get('.ant-modal-footer > .ant-btn > span').each(($el, index,$list) => {
            cy.wrap($el).click({ multiple: true })
          })
        // cy.get(':nth-child(6) > .ant-modal-root > .ant-modal-wrap > .ant-modal > .ant-modal-content > .ant-modal-footer > .ant-btn').click()
        cy.wait('@deleteProduct').its('response.statusCode').should('equal', 200);
});

// 自定义文件上传命令
Cypress.Commands.add('attachFile', (fileName, selector) => {
    cy.get(selector).then(subject => {
        cy.fixture(fileName, 'base64').then(content => {
            const el = subject[0];
            const testFile = new File([Cypress.Blob.base64StringToBlob(content)], fileName, { type: '' });
            const dataTransfer = new DataTransfer();

            dataTransfer.items.add(testFile);
            el.files = dataTransfer.files;

            cy.wrap(subject).trigger('change', { force: true });
        });
    });
});

// 轮询检查上传CSV 文件订单的接口 
Cypress.Commands.add('waitForPollingToEnd', () => {
    let shouldStopListening = false;

    cy.intercept('GET', '**/csv-global-bff/v1/query-upload-process?**').as('pollingRequest');

    const handlePollingResponse = (interception) => {
        const responseBody = interception.response.body;
        if (responseBody.data && responseBody.data.hasResult) {
            expect(interception.response.statusCode).to.equal(200);
            expect(responseBody.data.hasError).to.be.false;
            shouldStopListening = true;
        } else {
            cy.wait('@pollingRequest').then(handlePollingResponse);
        }
    };

    cy.wait('@pollingRequest').then(handlePollingResponse);
});

// 轮询检查下单接口
Cypress.Commands.add('waitForOrderPlacement', () => {
    let shouldStopListening = false;

    cy.intercept('POST', '**/dsers-order-bff/v1/search-placing-orders').as('orderPlacementRequest');

    const handleOrderPlacementResponse = (interception) => {
        const responseBody = interception.response.body;
        if (responseBody && responseBody.pendingCount === '0') {
            expect(interception.response.statusCode).to.equal(200);
            expect(responseBody.successCount).to.equal('1');
            shouldStopListening = true;
        } else {
            cy.wait('@orderPlacementRequest').then(handleOrderPlacementResponse);
        }
    };

    cy.wait('@orderPlacementRequest').then(handleOrderPlacementResponse);
});

// 获取import list 的商品id
Cypress.Commands.add('newclearImportList', () => {
    let authorization; 
    let itemId
    cy.visit('https://www.dsers.com/application/import_list');
    cy.intercept('GET', '**/dsers-product-bff/import-list**', (req) => {
        authorization = req.headers['authorization']; 
    }).as('getList');

    cy.wait('@getList').then((interception) => {
        const data = interception.response.body.data;
        itemId = data.map(item => item.id);
        cy.deleteImportListItem(authorization, itemId);
        // console.log(idList, authorization);
    });
});

// 删除import list 商品数据的接口
Cypress.Commands.add('deleteImportListItem', (authorization,itemId) => {
    const itemIdString = itemId.join(',');
    const url = `https://bff-api-gw-source.dsers.com/dsers-product-bff/import-list/${itemIdString}`;
    const headers = {
        'accept': 'application/json',
        'authorization': authorization
    };
    cy.request({
        method: 'DELETE',
        url: url,
        headers: headers
    }).then((response)=> {
        if (response.status === 200){
            cy.log('删除操作成功');
        }else{
            cy.sendErrorMessage('删除import list接口失败')
        }
    });
});

// 切换为csv 平台
Cypress.Commands.add('updatePlatform', (values) => {
    cy.request({
        method: 'POST',
        url: 'https://bff-api-gw-source.dsers.com/account-user-bff/v1/users/default/profile/set',
        headers: {
            'accept': 'application/json',
            'authorization': csvauthorization,
        },
        body: {
            profileType: "PROFILE_TYPE_APP",
            values: values
        },
    }).then((response)=> {
        if (response.status === 200){
            cy.log('切换成功');
        }else{
            cy.sendErrorMessage('csv 平台切换失败')
        }
    });
});

// 重置密码
Cypress.Commands.add('resetPassword',(oldpassword,newpassword) => {
    cy.request({
        method:'POST',
        url:'https://bff-api-gw-source.dsers.com/account-user-bff/v1/users/password/reset',
        headers:{
            'accept': 'application/json',
            'authorization': csvauthorization,
        },
        body:{
            oldPassword:oldpassword,
            newPassword:newpassword
        },
    }).then((response)=>{
        if (response.status === 200){
            cy.log('重置密码成功');
        }else{
            cy.sendErrorMessage('重置密码失败')
        }
    })
});

// fulfill 测试订单
Cypress.Commands.add('fulfillOrder', (orderId, lineItemIds) => {
    console.log('我进来了============',orderId, lineItemIds)
    cy.request({
      method: 'POST',
      url: 'https://bff-api-02-gw.dsers.com/dsers-order-bff/v1/fulfill-order',
      headers: {
        'Authorization': csvauthorization,
        'accept': 'application/json',
      },
      body: {
        orderId:orderId,
        lineItemIds:lineItemIds,
        storeId:'1760569468225589248',
        fulfillOnSeller:false
      }
    }).then((response)=> {
        if (response.status === 200){
            cy.log('fulfill 订单成功');
        }else{
            cy.sendErrorMessage('fulfill 订单失败')
        }
    });
});

// 使用csv 创建测试订单数据
Cypress.Commands.add('createOrder',() =>{
    // 进入CSV 上传文件页面
    cy.visit('https://www.dsers.com/application/csvOrder');
    // 进入上传订单页面
    cy.get('#rc-tabs-0-tab-2').click(); 
    // 点击上传文件按钮
    cy.get('#rc-tabs-0-panel-2 > .index_csvTableBox__E9mk- > :nth-child(1) > .index_csvFuncDot__hms7L > .ant-btn').click();   
    // 上传文件
    cy.attachFile('testplaceorderfile.xlsx', 'input[type="file"]');    
    // 点击上传文件按钮
    cy.get('.ant-modal-footer > :nth-child(2)').click();
    // 定义一个函数来处理拦截到的请求
    cy.waitForPollingToEnd();
    // 关闭上传文件弹窗
    cy.get('.ant-modal-close-x').click()
    // 进入订单页面的awaiting order tab
    cy.visit('https://www.dsers.com/application/orders/159831080')
})
