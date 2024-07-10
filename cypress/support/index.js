// // cypress/support/index.js
// import './commands';

// Cypress.on('fail', (error, runnable) => {
//     // 捕获到的错误信息
//     const errorMessage = error.message;
//     const stackTrace = error.stack;
//     const testTitle = runnable.title;

//     // 发送错误信息到飞书
//     const sendErrorMessage = (testTitle, errorMessage, stackTrace, traceId = '无') => {
//         let errorType = '未知错误类型';

//         // 根据错误信息判断错误类型
//         if (errorMessage.includes('Timed out retrying after 30000ms') || errorMessage.includes('could not be found')) {
//             errorType = '元素定位失败';
//         } else if (errorMessage.includes('expected')) {
//             errorType = '断言失败';
//         }

//         cy.request({
//             method: 'POST',
//             url: 'https://open.feishu.cn/open-apis/bot/v2/hook/ae6801a4-b568-4ddc-9ad8-b6636cf9b01c',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: {
//                 "msg_type": "text",
//                 "content": {
//                     "text": `用例名称: ${testTitle}\n\n测试失败类型: ${errorType}\n\n错误信息: ${errorMessage}\n\n报错内容: ${stackTrace}\n\nTrace ID: ${traceId}`
//                 }
//             }
//         });

//     // 调用发送告警的方法
//     cy.sendErrorMessage(testTitle, errorMessage, stackTrace);

//     // 抛出错误以保持 Cypress 的默认行为
//     throw error;
// });
