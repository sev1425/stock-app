const { YahooFinance } = require('yahoo-finance2');
async function test() {
  try {
    const yf = new YahooFinance();
    const quote = await yf.quote('AAPL');
    console.log("PRICE CJS:", quote.regularMarketPrice);
  } catch (e) {
    console.error("ERROR CJS:", e.message);
  }
}
test();
