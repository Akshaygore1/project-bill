"use server";

import { randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import db from "@/db";
import { orders, customers, services, user } from "@/db/schema";

export interface OrderItem {
  service_id: string;
  quantity: number;
}

export async function createOrders(
  userId: string,
  data: {
    customer_id: string;
    orderItems: OrderItem[];
  }
) {
  try {
    const orderPromises = data.orderItems.map((item) =>
      db
        .insert(orders)
        .values({
          id: randomUUID(),
          customer_id: data.customer_id,
          service_id: item.service_id,
          quantity: item.quantity,
          created_by: userId,
        })
        .returning()
    );

    const results = await Promise.all(orderPromises);
    return results.flat();
  } catch (error) {
    console.error("Error creating orders:", error);
    throw new Error("Failed to create orders");
  }
}

export async function getOrders() {
  try {
    const result = await db.select().from(orders).orderBy(orders.createdAt);
    return result;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Error("Failed to fetch orders");
  }
}

export interface OrderWithDetails {
  id: string;
  customer_id: string;
  service_id: string;
  quantity: number;
  created_by: string;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    name: string;
  };
  service: {
    name: string;
    price: string;
  };
  createdByUser: {
    name: string;
  };
}

export interface CustomerOrderGroup {
  customerName: string;
  customerId: string;
  totalAmount: number;
  orderCount: number;
  orders: OrderWithDetails[];
}

export interface CreatorOrderGroup {
  creatorName: string;
  creatorId: string;
  totalAmount: number;
  orderCount: number;
  orders: OrderWithDetails[];
}

export async function getOrdersWithDetails(): Promise<OrderWithDetails[]> {
  try {
    const result = await db
      .select({
        id: orders.id,
        customer_id: orders.customer_id,
        service_id: orders.service_id,
        quantity: orders.quantity,
        created_by: orders.created_by,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        customer: {
          name: customers.name,
        },
        service: {
          name: services.name,
          price: services.price,
        },
        createdByUser: {
          name: user.name,
        },
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customer_id, customers.id))
      .leftJoin(services, eq(orders.service_id, services.id))
      .leftJoin(user, eq(orders.created_by, user.id))
      .orderBy(orders.createdAt);

    return result as OrderWithDetails[];
  } catch (error) {
    console.error("Error fetching orders with details:", error);
    throw new Error("Failed to fetch orders with details");
  }
}

export async function getGroupedOrdersByCustomer(): Promise<
  CustomerOrderGroup[]
> {
  try {
    // Get all orders with details
    const ordersWithDetails = await getOrdersWithDetails();

    // Group orders by customer
    const groupedOrders = ordersWithDetails.reduce((acc, order) => {
      const customerName = order.customer?.name || "Unknown Customer";
      const customerId = order.customer_id;

      if (!acc[customerId]) {
        acc[customerId] = {
          customerName,
          customerId,
          orders: [],
          totalAmount: 0,
          orderCount: 0,
        };
      }

      const orderTotal = parseFloat(order.service.price) * order.quantity;
      acc[customerId].orders.push(order);
      acc[customerId].totalAmount += orderTotal;
      acc[customerId].orderCount += 1;

      return acc;
    }, {} as Record<string, CustomerOrderGroup>);

    // Convert to array and sort by customer name
    return Object.values(groupedOrders).sort((a, b) =>
      a.customerName.localeCompare(b.customerName)
    );
  } catch (error) {
    console.error("Error fetching grouped orders:", error);
    throw new Error("Failed to fetch grouped orders");
  }
}

export async function getGroupedOrdersByCreator(): Promise<
  CreatorOrderGroup[]
> {
  try {
    // Get all orders with details
    const ordersWithDetails = await getOrdersWithDetails();

    // Group orders by creator
    const groupedOrders = ordersWithDetails.reduce((acc, order) => {
      const creatorName = order.createdByUser?.name || "Unknown User";
      const creatorId = order.created_by;

      if (!acc[creatorId]) {
        acc[creatorId] = {
          creatorName,
          creatorId,
          orders: [],
          totalAmount: 0,
          orderCount: 0,
        };
      }

      const orderTotal = parseFloat(order.service.price) * order.quantity;
      acc[creatorId].orders.push(order);
      acc[creatorId].totalAmount += orderTotal;
      acc[creatorId].orderCount += 1;

      return acc;
    }, {} as Record<string, CreatorOrderGroup>);

    // Convert to array and sort by creator name
    return Object.values(groupedOrders).sort((a, b) =>
      a.creatorName.localeCompare(b.creatorName)
    );
  } catch (error) {
    console.error("Error fetching grouped orders by creator:", error);
    throw new Error("Failed to fetch grouped orders by creator");
  }
}
