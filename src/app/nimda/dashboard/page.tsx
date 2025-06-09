"use client";

import React from "react";
import AnalyticCard from "./components/AnalyticCard";
import SaleReportCard from "./components/SaleReportCard";
import IncomeOverview from "./components/IncomeOverview";
import UniqueVisitorCard from "./components/UniqueVisitorCard";
import ReportAreaChart from "./components/ReportAreaChart";
import TransactionHistory from "./components/TransactionHistory";

export default function Page() {
  return (
    <div className="min-h-screen bg-desi-cream p-6 space-y-8">
      <h1 className="text-3xl font-bold text-desi-black">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticCard title="Visitors" count="30,000" percentage={12} />
        <AnalyticCard title="Sales" count="$50,000" percentage={5} extra="2,000" />
        <AnalyticCard title="Orders" count="1,200" percentage={-3} isLoss />
        <AnalyticCard title="Revenue" count="$120K" percentage={8} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SaleReportCard />
        <IncomeOverview />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <UniqueVisitorCard />
        <ReportAreaChart />
      </div>
      <TransactionHistory />
    </div>
  );
} 
