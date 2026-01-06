import axios from "axios";
import * as cheerio from "cheerio";

export interface ScreenerFinancials {
  revenue: number | null;
  ebitda: number | null;
  pat: number | null;
  debtToEquity: number;
  cfo: number;
  bookValue: number;
  eps: number;
  peRatio: number;
  marketCap: number;
}

const SCREENER_SYMBOL_MAP: Record<string, string> = {
    "HDFCBANK": "HDFCBANK",
    "BAJFINANCE": "BAJFINANCE",
    "ICICIBANK": "ICICIBANK",
    "532174": "ICICIBANK",
    DMART: "DMART",
    "PIDILITE": "PIDILITIND",
    "500331": "PIDILITIND",
    "500400": "TATAPOWER",
    "543318": "CLEAN",
  };

const SCREENER_URLS: Record<string, string> = {
    'HDFCBANK': 'https://www.screener.in/company/HDFCBANK/',
    'BAJFINANCE': 'https://www.screener.in/company/BAJFINANCE/',
    'ICICIBANK': 'https://www.screener.in/company/ICICIBANK/',
    'AVENUE': 'https://www.screener.in/company/AVENUE/',
    'AFFLE': 'https://www.screener.in/company/AFFLE/',
    'LTIM': 'https://www.screener.in/company/LTIM/',
    'ASTRAL': 'https://www.screener.in/company/ASTRAL/',
    'TANLA': 'https://www.screener.in/company/TANLA/',
    'KPIT': 'https://www.screener.in/company/KPIT/',
    'TATATECH': 'https://www.screener.in/company/TATATECH/',
    'BLS': 'https://www.screener.in/company/BLS/',
    'TATACONSUM': 'https://www.screener.in/company/TATACONSUM/',
    'PIDILITIND': 'https://www.screener.in/company/PIDILITIND/',
    'TATAPOWER': 'https://www.screener.in/company/TATAPOWER/',
    'KPIGREEN': 'https://www.screener.in/company/KPIGREEN/',
    'SUZLON': 'https://www.screener.in/company/SUZLON/',
    'GENSOL': 'https://www.screener.in/company/GENSOL/',
    'HARIOM': 'https://www.screener.in/company/HARIOM/',
    'POLYCAB': 'https://www.screener.in/company/POLYCAB/',
    'CLEAN': 'https://www.screener.in/company/CLEAN/',
    'DEEPAKNTR': 'https://www.screener.in/company/DEEPAKNTR/',
    'FINEORG': 'https://www.screener.in/company/FINEORG/',
    'GRAVITA': 'https://www.screener.in/company/GRAVITA/',
    'SBILIFE': 'https://www.screener.in/company/SBILIFE/',
    'INFY': 'https://www.screener.in/company/INFY/',
    'HAPPSTMNDS': 'https://www.screener.in/company/HAPPSTMNDS/',
    'EASEMYTRIP': 'https://www.screener.in/company/EASEMYTRIP/',
}

export async function getScreenerData(symbol:string){
    console.log(
        "[SCREENER]",
        "raw:", symbol,
        "normalized:", SCREENER_SYMBOL_MAP[symbol] ?? symbol
      );
    try {
        const mappedSymbol = SCREENER_SYMBOL_MAP[symbol] ?? symbol;
        const url = SCREENER_URLS[mappedSymbol];
        if(!url) {
            console.warn(`Screener URL not found for symbol: ${symbol}`);
        }
        return await scrapeWithAxios(url);
       
    } catch (error) {
        console.error(`Error in getScreenerData for ${symbol}:`, error);
    }
}

async function scrapeWithAxios(url:string): Promise<any>{
    const res = await axios.get(url,
        {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
            timeout: 10000
        }
        );
    const stockData = cheerio.load(res.data);
    return stockData;
}
