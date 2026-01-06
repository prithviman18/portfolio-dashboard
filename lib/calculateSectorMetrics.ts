import { SectorSummary, StockResponse } from "./types";

export function sectorWiseMetrics(stocks: Partial<StockResponse>[]): SectorSummary[] {
    const sectorMap: Record<string, SectorSummary> = {};
    for (const stock of stocks) {
        if (
          !stock.sector ||
          typeof stock.investment !== "number" ||
          typeof stock.presentValue !== "number"
        ) {
          continue;
        }
    
        if (!sectorMap[stock.sector]) {
          sectorMap[stock.sector] = {
            sector: stock.sector,
            totalInvestment: 0,
            totalPresentValue: 0,
            totalGainLoss: 0,
            gainLossPercent: 0,
          };
        }
    
        sectorMap[stock.sector].totalInvestment += stock.investment;
        sectorMap[stock.sector].totalPresentValue += stock.presentValue;
      }
    
      return Object.values(sectorMap).map(sector => {
        const totalGainLoss =
          sector.totalPresentValue - sector.totalInvestment;
    
        return {
          ...sector,
          totalGainLoss,
          gainLossPercent:
            sector.totalInvestment > 0
              ? (totalGainLoss / sector.totalInvestment) * 100
              : 0,
        };
      });
}