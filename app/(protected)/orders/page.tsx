"use client";

import { OrderList } from "@/components/order-list";
import { Button } from "@/components/ui/button";
import { getGroupedOrdersByCreator } from "@/app/action/order";
import { handleCreateInvoice } from "@/lib/invoice-utils";
import { useState, useEffect } from "react";
import { CreatorOrderGroup } from "@/lib/types";

export default function OrdersPage() {
  const [groupedOrders, setGroupedOrders] = useState<CreatorOrderGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setIsLoading(true);
      const data = await getGroupedOrdersByCreator();
      setGroupedOrders(data);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setIsLoading(false);
    }
  }

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
            <h1 className="text-3xl font-bold">Orders by Creator</h1>
            <p className="text-sm text-gray-600">
              {groupedOrders.length} creator
              {groupedOrders.length !== 1 ? "s" : ""} •{" "}
              {groupedOrders.reduce(
                (total, group) => total + group.orderCount,
                0
              )}{" "}
              orders
            </p>
          </div>
        </div>
        {groupedOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No orders found.</p>
            <p className="text-sm text-gray-400 mt-2">
              Create your first order to get started.
            </p>
          </div>
        ) : (
          <OrderList
            groupedOrders={groupedOrders}
            onCreateInvoice={handleCreateInvoice}
          />
        )}
      </div>
    </div>
  );
}
