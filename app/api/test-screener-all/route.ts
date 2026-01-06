
import { getScreenerData } from "@/lib/ScreenerScrapper";
import { NextResponse } from "next/server";

const TEST_SYMBOLS = [
    'HDFCBANK', 'BAJFINANCE', 'ICICIBANK', 'DMART', 'AFFLE', 'LTIM',
    'ASTRAL', 'TANLA', 'KPIT', 'TATATECH', 'BLS', 'TATACONSUM',
    'PIDILITIND', 'TATAPOWER', 'KPIGREEN', 'SUZLON', 'GENSOL',
    'HARIOM', 'POLYCAB', 'CLEAN', 'DEEPAKNTR', 'FINEORG',
    'GRAVITA', 'SBILIFE', 'INFY', 'HAPPSTMNDS', 'EASEMYTRIP'
];

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const testAll = searchParams.get('all') === 'true';
        const symbol = searchParams.get('symbol') || 'HDFCBANK';
        
        if (testAll) {
            const results = [];
            
            for (const sym of TEST_SYMBOLS) {
                console.log(`Testing ${sym}...`);
                try {
                    const $ = await getScreenerData(sym);
                    
                    if ($) {
                        const data = extractFinancialData($, sym);
                        results.push({
                            symbol: sym,
                            status: 'success',
                            data
                        });
                    } else {
                        results.push({
                            symbol: sym,
                            status: 'failed',
                            error: 'No data returned'
                        });
                    }
                    
                    // Add delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                } catch (error) {
                    results.push({
                        symbol: sym,
                        status: 'error',
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            }
            
            const successCount = results.filter(r => r.status === 'success').length;
            
            return NextResponse.json({
                totalTested: TEST_SYMBOLS.length,
                successful: successCount,
                failed: TEST_SYMBOLS.length - successCount,
                results
            });
            
        } else {
            const $ = await getScreenerData(symbol);
            
            if (!$) {
                return NextResponse.json(
                    { error: "Failed to fetch data" },
                    { status: 404 }
                );
            }
            
            const data = extractFinancialData($, symbol);
            
            return NextResponse.json({
                success: true,
                symbol,
                data
            });
        }
        
    } catch (error) {
        console.error("Error testing screener:", error);
        return NextResponse.json(
            { 
                error: "Failed to scrape",
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}

function extractFinancialData($: any, symbol: string) {
    try {
        const parseNumber = (text: string): number | null => {
            if (!text) return null;
            const cleaned = text.replace(/,/g, '').trim();
            const num = parseFloat(cleaned);
            return isNaN(num) ? null : num;
        };
        
        // Extract from top ratios section
        const topRatios: Record<string, number | null> = {};
        $('#top-ratios li').each((i: number, el: any) => {
            const name = $(el).find('.name').text().trim();
            const value = $(el).find('.number').text().trim();
            topRatios[name] = parseNumber(value);
        });
        
        const companyName = $('h1').first().text().trim();
        const currentPrice = topRatios['Current Price'];
        const marketCap = topRatios['Market Cap'];
        const peRatio = topRatios['Stock P/E'];
        const bookValue = topRatios['Book Value'];
        const roe = topRatios['ROE'];
        const roce = topRatios['ROCE'];
        
        // Extract Debt to Equity from balance sheet
        let debtToEquity: number | null = null;
        
        // Calculate Debt to Equity = (Deposits + Borrowing) / Equity Capital
        // For banks, or just Borrowing / Equity for non-banks
        let deposits: number | null = null;
        let borrowing: number | null = null;
        let equityCapital: number | null = null;
        
        $('#balance-sheet table tbody tr').each((i: number, el: any) => {
            const rowName = $(el).find('td:first').text().trim();
            const lastValue = parseNumber($(el).find('td:last').text());
            
            if (rowName === 'Deposits') {
                deposits = lastValue;
            }
            if (rowName === 'Borrowing') {
                borrowing = lastValue;
            }
            if (rowName === 'Equity Capital') {
                equityCapital = lastValue;
            }
        });
        
        // Calculate Debt to Equity
        if (equityCapital && equityCapital > 0) {
            if (deposits && borrowing) {
                // Bank formula: (Deposits + Borrowing) / Equity
                debtToEquity = (deposits + borrowing) / equityCapital;
            } else if (borrowing) {
                // Non-bank formula: Borrowing / Equity
                debtToEquity = borrowing / equityCapital;
            }
        }
        
        // Extract quarterly data (most recent quarter)
        const quarterlyRevenue = parseNumber($('#quarters table tbody tr:first td:nth-child(2)').text());
        const quarterlyEBITDA = parseNumber($('#quarters table tbody tr:first td:nth-child(4)').text());
        const quarterlyPAT = parseNumber($('#quarters table tbody tr:first td:nth-child(5)').text());
        
        // Extract annual data from profit & loss table (TTM column - last column)
        let revenueTTM: number | null = null;
        let ebitdaTTM: number | null = null;
        let patTTM: number | null = null;
        
        // Also get the annual (previous full year - second to last column)
        let revenueAnnual: number | null = null;
        let ebitdaAnnual: number | null = null;
        let patAnnual: number | null = null;
        
        $('#profit-loss table tbody tr').each((i: number, el: any) => {
            const rowName = $(el).find('td:first').text().trim();
            const cells = $(el).find('td');
            const ttmValue = parseNumber($(cells[cells.length - 1]).text()); // Last column (TTM)
            const annualValue = parseNumber($(cells[cells.length - 2]).text()); // Second to last (latest full year)
            
            // Revenue
            if (rowName === 'Sales' || rowName === 'Operating Revenues' || rowName === 'Revenue +' || rowName === 'Total Income') {
                revenueTTM = ttmValue;
                revenueAnnual = annualValue;
            }
            
            // EBITDA (for banks it's "Financing Profit", for others "Operating Profit" or "EBITDA")
            if (rowName === 'Operating Profit' || rowName === 'EBITDA' || rowName === 'Financing Profit') {
                ebitdaTTM = ttmValue;
                ebitdaAnnual = annualValue;
            }
            
            // PAT
            if (rowName === 'Net Profit +' || rowName === 'Profit after tax' || rowName === 'Net Profit') {
                patTTM = ttmValue;
                patAnnual = annualValue;
            }
        });
        
        // Extract cash flow data (from last column - latest year)
        let cfo: number | null = null;
        let freeCashFlow: number | null = null;
        
        $('#cash-flow table tbody tr').each((i: number, el: any) => {
            const rowName = $(el).find('td:first').text().trim();
            const cells = $(el).find('td');
            const lastValue = parseNumber($(cells[cells.length - 1]).text());
            
            if (rowName === 'Cash from Operating Activity +' || rowName.includes('Operating Cash Flow')) {
                cfo = lastValue;
            }
            if (rowName === 'Free Cash Flow') {
                freeCashFlow = lastValue;
            }
        });
        
        return {
            companyName,
            currentPrice,
            marketCap,
            peRatio,
            bookValue,
            roe,
            roce,
            debtToEquity: debtToEquity ? parseFloat(debtToEquity.toFixed(2)) : null,
            revenue: {
                quarterly: quarterlyRevenue,
                ttm: revenueTTM,
                annual: revenueAnnual
            },
            ebitda: {
                quarterly: quarterlyEBITDA,
                ttm: ebitdaTTM,
                annual: ebitdaAnnual
            },
            pat: {
                quarterly: quarterlyPAT,
                ttm: patTTM,
                annual: patAnnual
            },
            cashFlow: {
                cfo,
                freeCashFlow
            },
            balanceSheet: {
                deposits,
                borrowing,
                equityCapital
            }
        };
        
    } catch (error) {
        console.error(`Error extracting data for ${symbol}:`, error);
        return {
            error: 'Failed to extract financial data',
            details: error instanceof Error ? error.message : String(error)
        };
    }
}