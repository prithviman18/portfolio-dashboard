"use client";
import PortfolioTable from "@/components/PortfolioTable";
import { ChartBarIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  async function fetchPortfolio() {
    try {
      setLoading(true);
      const res = await fetch("/api/portfolio");
      const data = await res.json();
      console.log("Response data:", data);
      setData(data);
      setLastUpdated(Date.now());
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
      setError("Failed to load portfolio data. Please try again later!");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPortfolio();
    const intervalId = setInterval(() => {
      fetchPortfolio();
    }, 15000);
    return () => clearInterval(intervalId);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-gray-800 mb-2">{error}</p>
          <button
            onClick={fetchPortfolio}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="bg-linear-to-r from-purple-900 via-purple-800 to-purple-900 shadow-xl border-b border-purple-700">
        <div className="px-4 md:px-8 py-5 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Portfolio Dashboard</span>
            <ChartBarIcon className="h-8 w-8 text-white" />
          </h1>

          <div className="relative group">
            <div className="w-11 h-11 bg-linear-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center hover:from-purple-500 hover:to-purple-500 transition-all duration-200 cursor-pointer shadow-lg ring-2 ring-purple-500 hover:ring-purple-400">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div className="absolute right-0 top-full mt-2 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg">
              Test User
            </div>
          </div>
        </div>
      </header>
      {lastUpdated && (
        <div className="text-sm text-gray-600 mt-1">
          Last updated: {new Date(lastUpdated).toLocaleTimeString()}
        </div>
      )}
      <main>
        <PortfolioTable stocks={data} />
      </main>

      <div className="mt-6 text-sm text-gray-500 text-center">
        <div className="inline-flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          Auto-refreshing every 15 seconds
        </div>
      </div>
    </div>
  );
}
