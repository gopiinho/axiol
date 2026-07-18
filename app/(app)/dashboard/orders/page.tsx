"use client";

import OrdersTable from "@/features/orders/components/OrdersTable";

export default function Orders() {
  return (
    <div>
      <section className="border-b p-5 sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="app-title">Orders</h1>
            <p className="app-subtitle mt-1">Track purchases and manage deliveries.</p>
          </div>
        </div>
      </section>
      <OrdersTable />
    </div>
  );
}
