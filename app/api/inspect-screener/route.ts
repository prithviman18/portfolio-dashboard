import { getScreenerData } from "@/lib/ScreenerScrapper";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const symbol = searchParams.get('symbol') || 'HDFCBANK';
        
        const $ = await getScreenerData(symbol);
        
        if (!$) {
            return NextResponse.json({ error: "Failed to fetch" }, { status: 404 });
        }
        
        // Get all ratios from the top section
        const topRatios: any = {};
        $('#top-ratios li').each((i:any, el:any) => {
            const name = $(el).find('.name').text().trim();
            const value = $(el).find('.number').text().trim();
            topRatios[name] = value;
        });
        
        // Get balance sheet data
        const balanceSheetRows: any = {};
        $('#balance-sheet table tbody tr').each((i:any, el:any) => {
            const rowName = $(el).find('td:first').text().trim();
            const lastValue = $(el).find('td:last').text().trim();
            if (rowName) {
                balanceSheetRows[rowName] = lastValue;
            }
        });
        
        // Get profit & loss table headers and first few rows
        const profitLossHeaders = $('#profit-loss table thead th').map((i:any, el:any) => $(el).text().trim()).get();
        const profitLossRows: any = {};
        $('#profit-loss table tbody tr').slice(0, 10).each((i:any, el:any) => {
            const rowName = $(el).find('td:first').text().trim();
            const values = $(el).find('td').map((j:any, td:any) => $(td).text().trim()).get();
            if (rowName) {
                profitLossRows[rowName] = values;
            }
        });
        
        // Get cash flow table
        const cashFlowHeaders = $('#cash-flow table thead th').map((i:any, el:any) => $(el).text().trim()).get();
        const cashFlowRows: any = {};
        $('#cash-flow table tbody tr').slice(0, 10).each((i:any, el:any) => {
            const rowName = $(el).find('td:first').text().trim();
            const values = $(el).find('td').map((j:any, td:any) => $(td).text().trim()).get();
            if (rowName) {
                cashFlowRows[rowName] = values;
            }
        });
        
        return NextResponse.json({
            symbol,
            topRatios,
            balanceSheetRows,
            profitLossHeaders,
            profitLossRows,
            cashFlowHeaders,
            cashFlowRows,
        });
        
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
