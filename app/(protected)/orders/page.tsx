"use client";

import { OrderList } from "@/components/order-list";
import { Button } from "@/components/ui/button";
import { getOrdersWithDetails } from "@/app/action/order";
import { useState, useEffect } from "react";
import { OrderWithDetails } from "@/lib/types";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setIsLoading(true);
      const data = await getOrdersWithDetails();
      setOrders(data);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleCreateInvoice = (order: OrderWithDetails) => {
    // TODO: Implement invoice creation functionality
    console.log("Creating invoice for order:", order);
    alert(`Invoice creation for order ${order.id} will be implemented soon!`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-lg">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="text-sm text-gray-600">{orders.length} orders</p>
          </div>
        </div>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No orders found.</p>
            <p className="text-sm text-gray-400 mt-2">
              Create your first order to get started.
            </p>
          </div>
        ) : (
          <OrderList orders={orders} onCreateInvoice={handleCreateInvoice} />
        )}
      </div>
    </div>
  );
}
