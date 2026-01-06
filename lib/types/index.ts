export interface Stock {
  id: number;
  particulars: string;
  purchasePrice: number;
  quantity: number;
  investment: number;
  portfolioPercent: number;
  nseBse: string;
  cmp: number;
  presentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  marketCap: number;
  peRatioTTM: number;
  peRatio: number;
  latestEarnings: number;
  revenue: number;
  revenueTTM: number;
  ebidta: number;
  ebitdaTTM: number;
  ebitdaPercentTTM: number;
  pat: number;
  patPercent: number;
  cfo: number;
  cfo5Years: number;
  freeCashFlow: number;
  freeCashflow5Years: number;
  debtToEquity: number;
  bookValue: number;
  revenueGrowth5Years: number;
  ebitdaGrowth: number;
  profitGrowth: number;
  marketCapGrowth: number;
  priceToSales: number;
  cfoToEbitda: number;
  cfoToPat: number;
  priceToBook: number;
  stage2?: boolean;
  salePrice?: number;
  sector: string;
}
export interface Sector {
  name: string;
  stocks: Stock[];
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
}

export interface StockResponse {
  id: number;
  sector: string;
  particulars: string;     
  nseBse: string;          
  purchasePrice: number;
  quantity: number;
  cmp: number;           
  peRatio: number;       
  latestEarnings: number; 
  investment: number;     
  presentValue: number;  
  gainLoss: number;       
  gainLossPercent: number;
  secor: string;
}
export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  gainLossPercent: number;
};
