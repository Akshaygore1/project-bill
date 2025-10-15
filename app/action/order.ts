"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
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
