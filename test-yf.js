const yf = require('yahoo-finance2').default;

async function test() {
  try {
    const quote = await yf.quote('AAPL');
    console.log(quote.regularMarketPrice);
  } catch (e) {
    console.error("ERROR:", e.message);
  }
}
test();
