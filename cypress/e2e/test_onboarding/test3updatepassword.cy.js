describe('update password', () => {
    const useremail = 'guofeng.liu@dserspro.com';
    const userpassword = 'DSers#9Pa$$w0';
    const newpassword = 'DSers20200409#'

    beforeEach(() => {
        // 登录并导航到目标页面
        cy.login(useremail, userpassword);
        cy.visit('https://accounts.dsers.com/accounts/security')
    });

    it('passes', () => {
        // 监听重置密码的接口
        cy.intercept('POST', '**/users/password/reset').as('resetRequest');
        // 点击修改密码按钮
        cy.get('.Security_pcClick__S9MSZ').click()
        // 输入旧密码
        cy.get('#change-password-form_oldPassword').focus().type(userpassword)
        // 输入新密码
        cy.get('#change-password-form_newPassword').focus().type(newpassword)
        // 确认新密码
        cy.get('#change-password-form_confirmPassword').focus().type(newpassword)
        // 点击确认按钮
        cy.get('.ant-btn-default').click()
        // 断言重置密码的接口状态码是否为200
        cy.wait('@resetRequest').its('response.statusCode').should('equal', 200);
        // 等待页面五秒，前端清除cookie
        cy.wait(5000)
        // 使用新密码登录验证是否修改成功
        cy.resetLogin(useremail, newpassword)
        // 重置为原始密码
        cy.resetPassword(newpassword,userpassword)

    });

    afterEach(() => {
        // 如果测试失败，发送请求到飞书
        const testTitle = '修改密码';
        cy.sendErrorMessage(testTitle);
        
    });
});