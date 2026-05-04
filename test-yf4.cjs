const yahooFinance = require('yahoo-finance2').default;
async function test() {
  try {
    const yf = new yahooFinance();
    const quote = await yf.quote('AAPL');
    console.log("PRICE CJS:", quote.regularMarketPrice);
  } catch (e) {
    console.error("ERROR CJS:", e.message);
  }
}
test();
