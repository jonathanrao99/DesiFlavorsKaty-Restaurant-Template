"use client";
import OrdersTable from "../dashboard/components/OrdersTable";
export default function OrdersPage() {
  return (
    <div className="min-h-screen p-4 bg-desi-cream">
      <h1 className="text-3xl font-bold text-desi-black mb-4">Orders</h1>
      <OrdersTable />
    </div>
  );
} 
