import YahooFinance from 'yahoo-finance2';

const YAHOO_SYMBOL_MAP: Record<string, string> = {
    "532174": "ICICIBANK",
    "500331": "PIDILITIND",
    "500400": "TATAPOWER",
    "543318": "CLEAN"
  };
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
export async function getStockQuote(symbol: string) {
    try {
        const yahooSymbol = YAHOO_SYMBOL_MAP[symbol] ?? symbol;
        const data = await yahooFinance.quote(`${yahooSymbol}.NS`);
        return data;
    } catch (error) {
        console.error(`Error fetching stock quote for ${symbol}:`, error);
        throw new Error("Failed to fetch stock quote");
    }
}