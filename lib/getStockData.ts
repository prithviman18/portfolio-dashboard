import { getScreenerData } from "./ScreenerScrapper";
import { getCache, setCache } from "./cache";
import { mockStoks } from "./data/mockData";
import { Stock, StockResponse } from "./types";
import { getStockQuote } from "./yahoo";

interface yahooData {
  regularMarketPrice: number;
  trailingPE: number;
  epsTrailingTwelveMonths: number;
  marketCap: number;
  bookValue: number;
  priceToBook: number;
  symbol: string;
}

interface ScreenerData {
  topRatios: Record<string, string>;
  profitLossRows: Record<string, string[]>;
  cashFlowRows: Record<string, string[]>;
  balanceSheetRows: Record<string, string>;
}

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

// function extractTTMValue(rows: Record<string, string[]>, key: string) {
//   if (!rows[key]) return 0;
//   const values = rows[key];
//   const lastVal = values[values.length - 1];
//   return convertStringToNum(lastVal);
// }

// function calculate5YearAvg(values: number[]) {
//   if (!values || values.length < 5) return 0;
//   let sum = 0;
//   for (let i = values.length; i > values.length - 5; i++) {
//     sum += values[i];
//   }
//   return sum / 5;
// }

// function extractHistoricValues(rows: Record<string, string[]>, key: string) {
//   if (!rows) return [];
//   return rows[key]
//     .slice(1)
//     .filter((val) => val && val.trim() !== "")
//     .map((val) => convertStringToNum(val))
//     .filter((num) => !isNaN(num));
// }
// function estimateFreeCashFlow(cfo: number, screenerData: ScreenerData) {
//   if (
//     !screenerData.cashFlowRows ||
//     !screenerData.cashFlowRows["Cash from Investing Activity +"]
//   ) {
//     return cfo;
//   }
//   const investingActivities =
//     screenerData.cashFlowRows["Cash from Investing Activity +"];
//   if (investingActivities && investingActivities.length > 1) {
//     const lastYearInvesting =
//       convertStringToNum(investingActivities[investingActivities.length - 2]) ||
//       0;
//     return cfo + lastYearInvesting;
//   }
// }

export async function getCompleteStockData(symbol: string) : Promise<Partial<StockResponse> | undefined> {
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
    const originalStockData = mockStoks.find(s => s.nseBse === symbol);
    if(!originalStockData){
      throw new Error("Original stock data not found");
    }
    const presentVal = (yfinanceData.regularMarketPrice || 0) * originalStockData.quantity;
    const investment = originalStockData.purchasePrice * originalStockData.quantity
    const peRatio =
  screenerData?.topRatios?.["P/E"] != null
    ? convertStringToNum(screenerData.topRatios["P/E"])
    : yfinanceData.trailingPE || 0;
    const gainLossPercent =
  investment > 0
    ? ((presentVal - investment) / investment) * 100
    : 0;
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
      presentValue: (yfinanceData.regularMarketPrice || 0) * originalStockData.quantity,
      gainLoss: presentVal - investment,
      peRatio: peRatio,
      latestEarnings: yfinanceData.epsTrailingTwelveMonths ,
      gainLossPercent: gainLossPercent,
      sector: originalStockData.sector,
    }
    setCache(cacheKey, completeStockData);
    return completeStockData;
  } catch (error) {
    console.error(`Error in getCompleteStockData for ${symbol}:`, error);
    return undefined;
  }
}

// export async function getCompleteStockData(symbol: string) {
//   const cacheKey = `${symbol}_complete`;
//   const cached = getCache<Partial<Stock>>(cacheKey);
//   if (cached) {
//     console.log(`Using cached data for ${symbol}`);
//     return cached;
//   }
//   try {
//     console.log(`Fetching complete data for ${symbol}`);
//     const [yfinanceData, screenerData] = await Promise.all([
//       getStockQuote(symbol),
//       getScreenerData(symbol),
//     ]);
//     if (!yfinanceData || !screenerData) {
//       throw new Error("Incomplete data fetched");
//     }
//     const originalStockData = mockStoks.find(s => s.nseBse === symbol);
//     if(!originalStockData){
//       throw new Error("Original stock data not found");
//     }
//     const cmp = yfinanceData.regularMarketPrice || 0;
//     const quantity = originalStockData.quantity;
//     const investment = originalStockData.purchasePrice * quantity;
//     const presentValue = cmp * quantity;
//     const topRatios = screenerData.topRatios || {};
//     const profitLossRows = screenerData.profitLossRows || {};
//     const cashFlowRows = screenerData.cashFlowRows || {};
//     const balanceSheetRows = screenerData.balanceSheetRows || {};
//     const revenueTTM = extractTTMValue(profitLossRows, "Revenue +");
//     const ebitdaTTM = extractTTMValue(profitLossRows, "Financing Profit");
//     const patTTM = extractTTMValue(profitLossRows, "Net Profit +");
//     const cfo = extractTTMValue(cashFlowRows, "Cash from Operating Activity +");

//     const cfoHistorical = extractHistoricValues(
//       cashFlowRows,
//       "Cash from Operating Activity +"
//     );
//     const cfo5Years = calculate5YearAvg(cfoHistorical);
//     const freeCashFlow = estimateFreeCashFlow(cfo, screenerData);

//     let freeCashFlow5Years = 0;
//     if (
//       cashFlowRows["Cash from Operating Activity +"] &&
//       cashFlowRows["Cash from Investing Activity +"]
//     ) {
//       const operatingActivities =
//         cashFlowRows["Cash from Operating Activity +"];
//       const investingActivities =
//         cashFlowRows["Cash from Investing Activity +"];
//       const fcfHistorical = [];

//       for (let i = 1; i < operatingActivities.length; i++) {
//         const cfoVal = convertStringToNum(operatingActivities[i]);
//         const investingVal = convertStringToNum(investingActivities[i]);
//         fcfHistorical.push(cfoVal + investingVal);
//       }
//       freeCashFlow5Years = calculate5YearAvg(fcfHistorical);
//     }
//     let debtToEquity = 0;
//     if (
//       balanceSheetRows["Borrowing"] &&
//       balanceSheetRows["Equity Capital"] &&
//       balanceSheetRows["Reserves"]
//     ) {
//       const borrowing = convertStringToNum(balanceSheetRows["Borrowing"]);
//       const equityCapital = convertStringToNum(
//         balanceSheetRows["Equity Capital"]
//       );
//       const reserves = convertStringToNum(balanceSheetRows["Reserves"]);
//       const totalEquity = equityCapital + reserves;
//       if (totalEquity > 0) {
//         debtToEquity = borrowing / totalEquity;
//       }
//     }
    
//     const revenueHistorical = extractHistoricValues(
//       profitLossRows,
//       "Revenue +"
//     );
//     const ebitdaHistorical = extractHistoricValues(
//       profitLossRows,
//       "Financing Profit"
//     );
//     const patHistorical = extractHistoricValues(profitLossRows, "Net Profit +");
//     const completeStockData: Partial<Stock> = {
//       cmp: yfinanceData.regularMarketPrice || 0,
//       peRatio: yfinanceData.trailingPE || 0,
//       peRatioTTM: yfinanceData.trailingPE || 0,
//       latestEarnings: yfinanceData.epsTrailingTwelveMonths || 0,
//       marketCap: yfinanceData.marketCap || 0,
//       bookValue: yfinanceData.bookValue || 0,
//       priceToBook: yfinanceData.priceToBook || 0,
//       revenue: convertStringToNum(topRatios["Revenue +"] || "0"),
//       revenueTTM: revenueTTM,
//       ebidta: convertStringToNum(topRatios["EBITDA"] || "0"),
//       ebitdaTTM: ebitdaTTM,
//       pat: convertStringToNum(topRatios["Net Profit"] || "0"),
//       cfo: cfo,
//       cfo5Years: cfo5Years,
//       freeCashFlow: freeCashFlow,
//       debtToEquity: debtToEquity,
//       ebitdaPercentTTM: ebitdaTTM && revenueTTM ? ebitdaTTM / revenueTTM : 0,
//       patPercent: patTTM && revenueTTM ? patTTM / revenueTTM : 0,
//       marketCapGrowth: 0,
//       priceToSales: yfinanceData.marketCap && revenueTTM ? yfinanceData.marketCap / revenueTTM : 0,
//       cfoToEbitda: cfo && ebitdaTTM ? ebitdaTTM / cfo : 0,
//       cfoToPat: cfo && patTTM ? patTTM / cfo : 0,
//       nseBse: symbol,
//       particulars: yfinanceData.longName || symbol,
   
//   };

//   setCache(cacheKey, completeStockData);
  
//   return completeStockData;
//   } catch (error) {
//     console.error(`Error in getCompleteStockData for ${symbol}:`, error);
//   }
// }
