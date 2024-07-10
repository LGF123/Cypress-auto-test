describe('Edit product', () => {
    const useremail = 'guofeng.liu@dserspro.com';
    const userpassword = 'DSers#9Pa$$w0';
    const product_url = 'https://www.aliexpress.us/item/3256806027225550.html';
    const product_name = 'test product name'
    const product_price = '99.00'
    const product_stock = '999'
    const product_sku = 'testsku'

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
        cy.intercept('PUT', '**/import-list/**').as('editproductRequest');
        // 点击编辑商品按钮
        cy.get('.sc_below_toolbarRibbon >:nth-child(1)>svg').click();
        // 定位到商品名称的title，并且输入数据
        cy.get('#title').focus().clear().type(product_name);
        // 进入商品详情的variants 页面
        cy.get('div[data-node-key="Variants"]').click();
        // 定位到price 的输入框并且修改为99.00
        cy.get('[id="price^^14:200006153#blue^^0"]').focus().clear().type(product_price);
        // 定位到Compare At Price 的输入框并且修改为99.00
        cy.get('[id="compareAtPrice^^14:200006153#blue^^0"]').focus().clear().type(product_price);
        // 定位到编辑SKU 输入框并修改为testsku
        cy.get('[id="sku^^14:200006153#blue^^0"]').focus().clear().type(product_sku)
        // 订单为到销端库存输入框并修改为999
        cy.get('[id="stock^^14:200006153#blue^^0"]').focus().clear().type(product_stock)
        // 点击save 按钮
        cy.get('.ant-drawer-footer > :nth-child(2) > .ant-btn-default').click();
        cy.wait('@editproductRequest').then((interception) => {
            // 断言接口响应是否是200
            expect(interception.response.statusCode).to.equal(200);
            const reqboby = interception.request.body;
            const firstVariant = reqboby.variants[0];
            // 断言前端提交的内容是否正确
            expect(reqboby.title).to.equal(product_name)
            expect(firstVariant.compareAtPrice).to.equal('9900');
            expect(firstVariant.price).to.equal('9900');
            expect(firstVariant.stock).to.equal(999);
            expect(firstVariant.sku).to.equal(product_sku);
            // 清除import list测试数据   
            cy.newclearImportList()
        });
    });

    afterEach(function () {
        // 如果测试失败，发送请求到飞书
        const testTitle = '编辑供端商品'
        cy.sendErrorMessage(testTitle);
    });
});
