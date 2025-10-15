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

export interface CreatorCustomerOrderGroup {
  creatorName: string;
  creatorId: string;
  customerName: string;
  customerId: string;
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
    // Use Drizzle query with GROUP BY for customer grouping
    const groupedResult = await db
      .select({
        customerId: orders.customer_id,
        customerName: customers.name,
        totalAmount: sql<number>`SUM(${services.price} * ${orders.quantity})`,
        orderCount: sql<number>`COUNT(${orders.id})`,
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customer_id, customers.id))
      .leftJoin(services, eq(orders.service_id, services.id))
      .groupBy(orders.customer_id, customers.name)
      .orderBy(customers.name);

    // Get all orders with details for populating the groups
    const ordersWithDetails = await getOrdersWithDetails();

    // Create a map for quick lookup of orders by customer
    const ordersByCustomer = ordersWithDetails.reduce((acc, order) => {
      const customerId = order.customer_id;
      if (!acc[customerId]) {
        acc[customerId] = [];
      }
      acc[customerId].push(order);
      return acc;
    }, {} as Record<string, OrderWithDetails[]>);

    // Combine the grouped results with individual orders
    const result: CustomerOrderGroup[] = groupedResult.map((group) => ({
      customerId: group.customerId || "",
      customerName: group.customerName || "Unknown Customer",
      totalAmount: Number(group.totalAmount) || 0,
      orderCount: group.orderCount || 0,
      orders: ordersByCustomer[group.customerId || ""] || [],
    }));

    return result;
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

export async function getGroupedOrdersByCreatorAndCustomer(): Promise<
  CreatorCustomerOrderGroup[]
> {
  try {
    // Use Drizzle query with GROUP BY for creator and customer combination
    const groupedResult = await db
      .select({
        creatorId: orders.created_by,
        creatorName: user.name,
        customerId: orders.customer_id,
        customerName: customers.name,
        totalAmount: sql<number>`SUM(${services.price} * ${orders.quantity})`,
        orderCount: sql<number>`COUNT(${orders.id})`,
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customer_id, customers.id))
      .leftJoin(services, eq(orders.service_id, services.id))
      .leftJoin(user, eq(orders.created_by, user.id))
      .groupBy(orders.created_by, orders.customer_id, user.name, customers.name)
      .orderBy(user.name, customers.name);

    // Get all orders with details for populating the groups
    const ordersWithDetails = await getOrdersWithDetails();

    // Create a map for quick lookup of orders by creator-customer combination
    const ordersByGroup = ordersWithDetails.reduce((acc, order) => {
      const groupKey = `${order.created_by}-${order.customer_id}`;
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(order);
      return acc;
    }, {} as Record<string, OrderWithDetails[]>);

    // Combine the grouped results with individual orders
    const result: CreatorCustomerOrderGroup[] = groupedResult.map((group) => {
      const groupKey = `${group.creatorId}-${group.customerId}`;
      return {
        creatorId: group.creatorId || "",
        creatorName: group.creatorName || "Unknown User",
        customerId: group.customerId || "",
        customerName: group.customerName || "Unknown Customer",
        totalAmount: Number(group.totalAmount) || 0,
        orderCount: group.orderCount || 0,
        orders: ordersByGroup[groupKey] || [],
      };
    });

    return result;
  } catch (error) {
    console.error(
      "Error fetching grouped orders by creator and customer:",
      error
    );
    throw new Error("Failed to fetch grouped orders by creator and customer");
  }
}
