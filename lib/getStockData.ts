import { getScreenerData } from "./ScreenerScrapper";
import { getCache, setCache } from "./cache";
import { mockStoks } from "./data/mockData";
import { Stock, StockResponse } from "./types";
import { getStockQuote } from "./yahoo";

function convertStringToNum(value: string | number | null) {
  if (!value) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleanString = value.replace(/,/g, "");
    const num = Number(cleanString);

    return isNaN(num) ? 0 : num;
  }
  return 0;
}

function isMarketOpen(): boolean {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const day = now.getDay();

  if (day === 0 || day === 6) return false;

  const time = hours * 60 + minutes;
  return time >= 555 && time <= 930;
}
export async function getCompleteStockData(
  symbol: string
): Promise<Partial<StockResponse> | undefined> {
  // const ENABLE_PRICE_SIMULATION = true;
  const cacheKey = `${symbol}_complete`;

  const cached = getCache<Partial<Stock>>(cacheKey);
  if (cached) {
    console.log(`Using cached data for ${symbol}`);
    return cached;
  }
  try {
    console.log(`Fetching complete data for ${symbol}`);
    const [yahooRes, screenerRes] = await Promise.allSettled([
      getStockQuote(symbol),
      getScreenerData(symbol),
    ]);

    const yfinanceData =
      yahooRes.status === "fulfilled" ? yahooRes.value : null;

    const screenerData =
      screenerRes.status === "fulfilled" ? screenerRes.value : null;
    if (!yfinanceData) {
      throw new Error("Yahoo data missing");
    }

    if (!screenerData) {
      console.warn(`Screener data missing for ${symbol}`);
    }
    const originalStockData = mockStoks.find((s) => s.nseBse === symbol);
    if (!originalStockData) {
      throw new Error("Original stock data not found");
    }
    const presentVal =
      (yfinanceData.regularMarketPrice || 0) * originalStockData.quantity;
    const basePrice = yfinanceData.regularMarketPrice || 0;

    // const simulatedPrice =
    //   ENABLE_PRICE_SIMULATION && !isMarketOpen()
    //     ? basePrice * (1 + (Math.random() - 0.5) / 100) // ±0.5%
    //     : basePrice;

    // const presentVal = simulatedPrice * originalStockData.quantity;
    const investment =
      originalStockData.purchasePrice * originalStockData.quantity;
    const peRatio =
      screenerData?.topRatios?.["P/E"] != null
        ? convertStringToNum(screenerData.topRatios["P/E"])
        : yfinanceData.trailingPE || 0;
    const gainLossPercent =
      investment > 0 ? ((presentVal - investment) / investment) * 100 : 0;
    // const netProfitRow = screenerData.profitLossRows["Net Profit +"];
    // const latestNetProfit = convertStringToNum(netProfitRow[netProfitRow.length - 1]);
    const completeStockData = {
      particulars: yfinanceData.longName || symbol,
      purchasePrice: originalStockData.purchasePrice,
      quantity: originalStockData.quantity,
      investment: investment,
      portfolioPercent: originalStockData.portfolioPercent,
      nseBSE: originalStockData.nseBse,
      cmp: yfinanceData.regularMarketPrice || 0, // current market price
      presentValue:
        (yfinanceData.regularMarketPrice || 0) * originalStockData.quantity,
      //       cmp: simulatedPrice,
      // presentValue: presentVal,
      gainLoss: presentVal - investment,
      peRatio: peRatio,
      latestEarnings: yfinanceData.epsTrailingTwelveMonths,
      gainLossPercent: gainLossPercent,
      sector: originalStockData.sector,
    };
    setCache(cacheKey, completeStockData);
    return completeStockData;
  } catch (error) {
    console.error(`Error in getCompleteStockData for ${symbol}:`, error);
    return undefined;
  }
}
