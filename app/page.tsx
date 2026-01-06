"use client";
import PortfolioTable from "@/components/PortfolioTable";
import { useEffect, useState } from "react";

export default function Home() {

  const[data,setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchPortfolio(){
    try {
      setLoading(true);
      const res = await fetch('/api/portfolio');
      const data = await res.json(); 
      console.log("Response data:", data);
      setData(data);
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
      setError("Failed to load portfolio data. Please try again later!")
    } finally{
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPortfolio();
    const intervalId = setInterval(() => {
      fetchPortfolio();
    }, 15000); 
    return () => clearInterval(intervalId);
  },[]);
  
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
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Portfolio Dashboard
        </h1>
        <p className="text-gray-700 mt-2 mb-2 font-light ">
          Real-time stock portfolio tracking with automatic updates every 15 seconds
        </p>
      </header>

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
