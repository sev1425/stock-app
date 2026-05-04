const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, 'api');
const files = fs.readdirSync(apiDir).filter(f => f.endsWith('.js'));

for (const file of files) {
  const filePath = path.join(apiDir, file);
  if (file === 'health.js') continue; // health.js doesn't use yahooFinance

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the old import and suppression with the new one
  content = content.replace(
    "import yahooFinance from 'yahoo-finance2';\nyahooFinance.suppressNotices(['yahooSurvey', 'ripHistorical']);",
    "import YahooFinanceLib from 'yahoo-finance2';\nconst yahooFinance = new YahooFinanceLib();\nyahooFinance.suppressNotices(['yahooSurvey', 'ripHistorical']);"
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated', file);
}
