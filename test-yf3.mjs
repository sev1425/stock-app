import yahooFinance from 'yahoo-finance2';
console.log("yahooFinance is:", typeof yahooFinance, yahooFinance.name);

async function test() {
  try {
    // maybe we need to destructure or use new
    // in v3, is it a class?
    let yf;
    if (typeof yahooFinance === 'function') {
      yf = new yahooFinance();
    } else if (yahooFinance.default && typeof yahooFinance.default === 'function') {
      yf = new yahooFinance.default();
    }
    const quote = await yf.quote('AAPL');
    console.log("PRICE:", quote.regularMarketPrice);
  } catch (e) {
    console.error("ERROR:", e.message);
  }
}
test();
