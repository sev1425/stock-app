import yahooFinance from 'yahoo-finance2';

async function test() {
  try {
    const yf = new yahooFinance();
    const quote = await yf.quote('AAPL');
    console.log(quote.regularMarketPrice);
  } catch (e) {
    console.error("ERROR 1:", e.message);
  }
}
test();
