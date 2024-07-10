const { defineConfig } = require("cypress");
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

module.exports = defineConfig({
  projectId: 'xxzqqu',
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        modifyExcel() {
          const workbook = XLSX.readFile('cypress/fixtures/testplaceorderfile.xlsx');
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const currentTimestamp = new Date().getTime();
          
          // 修改A2单元格的数据为当前时间戳
          worksheet['A2'].v = currentTimestamp;
          
          // 使用promisify将fs.writeFile转换为返回Promise的函数
          const writeFilePromise = promisify(fs.writeFile);
          
          // 保存修改后的Excel文件
          return writeFilePromise('cypress/fixtures/testplaceorderfile.xlsx', Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }))).then(() => {
            return null;
          });
        }
      });
    },
    "defaultCommandTimeout": 30000, 
    "video": true,
    "requestTimeout": 120000,
    // "supportFile": "cypress/support/index.js",
    "fixturesFolder": "cypress/fixtures"    
  },
});
