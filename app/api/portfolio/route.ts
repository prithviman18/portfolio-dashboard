import { mockStoks } from "@/lib/data/mockData";
import { NextResponse } from "next/server";
import { getCompleteStockData } from "@/lib/getStockData";
import { getStockQuote } from "@/lib/yahoo";


export async function GET(){
    try {
        const results = await Promise.all(
            mockStoks.map(stock =>
              getCompleteStockData(stock.nseBse)
            )
          );
        return NextResponse.json(results.filter(res => res !== undefined));
    } catch (error) {
        console.error("Portfolio API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio data" },
      { status: 500 }
    );
    }
}
// export async function GET() {
//     try {
//         const res = await getStockQuote("HDFCBANK.NS");

//         if (!res) {
//             return new Response(JSON.stringify({ error: "Stock not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
//         }
//         return new Response(JSON.stringify(res), { status: 200, headers: { "Content-Type": "application/json" } });
//     } catch (error) {
//         console.error("Error in /api/portfolio route:", error);
//         return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
//     }
// }

