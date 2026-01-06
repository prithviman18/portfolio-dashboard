"use client";
import { StockResponse } from "@/lib/types";
import { ChartBarIcon } from "@heroicons/react/16/solid";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PortfolioTableProps {
  stocks: StockResponse[];
}

export default function PortfolioTable({ stocks }: PortfolioTableProps) {
  const [groupedData, setGroupedData] = useState<
    Record<string, StockResponse[]>
  >({});
  const [sectorTotals, setSectorTotals] = useState<Record<string, any>>({});
  const [overallTotal, setOverallTotal] = useState({
    totalInvestment: 0,
    totalPresentValue: 0,
    totalGainLoss: 0,
  });
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [showChartModal, setShowChartModal] = useState(false);
  useEffect(() => {
    const grouped: Record<string, StockResponse[]> = {};
    const sectorTotalsMap: Record<string, any> = {};

    let totalInvestment = 0;
    let totalPresentValue = 0;
    let totalGainLoss = 0;

    stocks.forEach((stock) => {
      const sector = stock.sector || "Others";
      if (!grouped[sector]) {
        grouped[sector] = [];
      }
      grouped[sector].push(stock);
      if (!sectorTotalsMap[sector]) {
        sectorTotalsMap[sector] = {
          investment: 0,
          presentValue: 0,
          gainLoss: 0,
          stocks: 0,
        };
      }

      sectorTotalsMap[sector].investment += stock.investment;
      sectorTotalsMap[sector].presentValue += stock.presentValue;
      sectorTotalsMap[sector].gainLoss += stock.gainLoss;
      sectorTotalsMap[sector].stocks += 1;

      totalInvestment += stock.investment;
      totalPresentValue += stock.presentValue;
      totalGainLoss += stock.gainLoss;
    });

    setGroupedData(grouped);
    setSectorTotals(sectorTotalsMap);
    setOverallTotal({
      totalInvestment,
      totalPresentValue,
      totalGainLoss,
    });
  }, [stocks]);

  const handleChartClick = (sector: string) => {
    setSelectedSector(sector);
    setShowChartModal(true);
  };

  const getSectorChartData = () => {
    if (!selectedSector) return [];

    const sectorStocks = groupedData[selectedSector] || [];
    return sectorStocks.map((stock) => ({
      name:
        stock.particulars.length > 10
          ? stock.particulars.substring(0, 10) + "..."
          : stock.particulars,
      Investment: stock.investment,
      "Current Value": stock.presentValue,
      "Gain/Loss": stock.gainLoss,
      fullName: stock.particulars,
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-linear-to-r from-purple-200 via-violet-200 to-indigo-200 p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Portfolio Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Total Investment</div>
            <div className="text-xl font-bold text-gray-800">
              ₹{overallTotal.totalInvestment.toFixed(2)}
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Current Value</div>
            <div className="text-xl font-bold text-gray-800">
              ₹{overallTotal.totalPresentValue.toFixed(2)}
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Total Gain/Loss</div>
            <div
              className={`text-xl font-bold ${
                overallTotal.totalGainLoss >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              ₹{overallTotal.totalGainLoss.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {Object.entries(groupedData).map(([sector, sectorStocks]) => (
        <div key={sector} className="border-b last:border-b-0">
          <div className="bg-linear-to-r from-purple-100 via-violet-100 to-indigo-100 px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-gray-800">{sector}</h3>
              <button
                onClick={() => handleChartClick(sector)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors group"
                title={`View ${sector} sector charts`}
              >
                <ChartBarIcon className="h-5 w-5 text-gray-600 group-hover:text-purple-600" />
              </button>
            </div>
            <div className="text-sm text-gray-600">
              <span className="mr-4">
                Investment: ₹
                {(sectorTotals[sector]?.investment || 0).toFixed(2)}
              </span>
              <span className="mr-4">
                Value: ₹{(sectorTotals[sector]?.presentValue || 0).toFixed(2)}
              </span>
              <span
                className={`font-medium ${
                  sectorTotals[sector]?.gainLoss >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                P&L: ₹{(sectorTotals[sector]?.gainLoss || 0).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchase Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Investment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Portfolio %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CMP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Present Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gain/Loss
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P/E Ratio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Latest Earnings
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sectorStocks.map((stock) => (
                  <tr key={stock.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {stock.particulars}
                          </div>
                          <div className="text-sm text-gray-500">
                            {stock.nseBse}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{stock.purchasePrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stock.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{stock.investment.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{stock.cmp.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{stock.presentValue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          stock.gainLoss >= 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        ₹{stock.gainLoss.toFixed(2)} (
                        {(stock.gainLossPercent || 0).toFixed(2)}%)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stock.peRatio?.toFixed(2) || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{(stock.latestEarnings || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      {showChartModal && selectedSector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {selectedSector} Sector Chart
                </h3>
                <button
                  onClick={() => setShowChartModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="h-96 mb-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">
                  Investment vs Current Value
                </h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getSectorChartData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number | undefined) => {
                        if (value === undefined) return ["₹0.00", ""];
                        return [`₹${value.toFixed(2)}`, ""];
                      }}
                      labelFormatter={(label, payload) => {
                        const data = payload?.[0]?.payload;
                        return data?.fullName || label;
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="Investment"
                      fill="#8884d8"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="Current Value"
                      fill="#82ca9d"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">
                  Quick Stats
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded shadow">
                    <div className="text-sm text-gray-500">Stocks</div>
                    <div className="text-xl font-bold">
                      {groupedData[selectedSector]?.length || 0}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded shadow">
                    <div className="text-sm text-gray-500">
                      Total Investment
                    </div>
                    <div className="text-xl font-bold text-gray-800">
                      ₹
                      {(sectorTotals[selectedSector]?.investment || 0).toFixed(
                        2
                      )}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded shadow">
                    <div className="text-sm text-gray-500">Net P&L</div>
                    <div
                      className={`text-xl font-bold ${
                        (sectorTotals[selectedSector]?.gainLoss || 0) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      ₹
                      {(sectorTotals[selectedSector]?.gainLoss || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
