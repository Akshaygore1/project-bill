"use client";

import { OrderList } from "@/components/order-list";
import { Button } from "@/components/ui/button";
import { getGroupedOrdersByCreator } from "@/app/action/order";
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

  const handleCreateInvoice = (creatorGroup: CreatorOrderGroup) => {
    // Generate invoice HTML
    const invoiceHTML = generateInvoiceHTML(creatorGroup);

    // Open invoice in new window
    const invoiceWindow = window.open("", "_blank", "width=800,height=600");
    if (invoiceWindow) {
      invoiceWindow.document.write(invoiceHTML);
      invoiceWindow.document.close();
      invoiceWindow.print();
    }
  };

  const generateInvoiceHTML = (creatorGroup: CreatorOrderGroup) => {
    const invoiceNumber = `INV-${Date.now()}`;
    const currentDate = new Date().toLocaleDateString();
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount);
    };

    const orderRows = creatorGroup.orders
      .map(
        (order) => `
      <tr>
        <td>${order.customer?.name || "Unknown Customer"}</td>
        <td>${order.service?.name || "Unknown Service"}</td>
        <td>${order.quantity}</td>
        <td>${formatCurrency(
          parseFloat(order.service.price) * order.quantity
        )}</td>
        <td>${new Date(order.createdAt).toLocaleDateString()}</td>
      </tr>
    `
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; font-size: 18px; }
            .print-button { display: none; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE</h1>
            <h2>${invoiceNumber}</h2>
          </div>

          <div class="invoice-details">
            <div>
              <h3>Creator: ${creatorGroup.creatorName}</h3>
              <p>Total Orders: ${creatorGroup.orderCount}</p>
            </div>
            <div>
              <p><strong>Date:</strong> ${currentDate}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Service</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${orderRows}
            </tbody>
          </table>

          <div class="total">
            <p>Total Amount: ${formatCurrency(creatorGroup.totalAmount)}</p>
          </div>

          <div style="margin-top: 50px; text-align: center; color: #666;">
            <p>Thank you for your business!</p>
          </div>

          <button class="print-button" onclick="window.print()">Print Invoice</button>
        </body>
      </html>
    `;
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
