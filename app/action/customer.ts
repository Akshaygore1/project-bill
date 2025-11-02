"use server";

import db from "@/db";
import { customers, customerServicePrices } from "@/db/schema";
import { randomUUID } from "crypto";
import { eq, and } from "drizzle-orm";

export async function createCustomer(data: {
  name: string;
  phone_number: string;
  address?: string;
  payment_due_date?: number;
  servicePrices?: { service_id: string; custom_price: number }[];
}) {
  try {
    const customerId = randomUUID();
    const customer = await db
      .insert(customers)
      .values({
        id: customerId,
        name: data.name,
        phone_number: data.phone_number,
        address: data.address || null,
        payment_due_date: data.payment_due_date || null,
      })
      .returning();
    
    // Insert custom service prices if provided
    if (data.servicePrices && data.servicePrices.length > 0) {
      await db.insert(customerServicePrices).values(
        data.servicePrices.map(sp => ({
          id: randomUUID(),
          customer_id: customerId,
          service_id: sp.service_id,
          custom_price: sp.custom_price.toString(),
        }))
      );
    }
    
    return customer[0];
  } catch (error) {
    console.error("Error creating customer:", error);
    throw new Error("Failed to create customer");
  }
}

export async function getCustomers() {
  try {
    return await db.select().from(customers).orderBy(customers.createdAt);
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw new Error("Failed to fetch customers");
  }
}

export async function getCustomerServicePrices(customerId: string) {
  try {
    const result = await db
      .select()
      .from(customerServicePrices)
      .where(eq(customerServicePrices.customer_id, customerId));
    return result.map((price) => ({
      ...price,
      custom_price: parseFloat(price.custom_price),
    }));
  } catch (error) {
    console.error("Error fetching customer service prices:", error);
    throw new Error("Failed to fetch customer service prices");
  }
}

export async function updateCustomerServicePrices(
  customerId: string,
  servicePrices: { service_id: string; custom_price: number }[]
) {
  try {
    // Delete existing custom prices for this customer
    await db
      .delete(customerServicePrices)
      .where(eq(customerServicePrices.customer_id, customerId));

    // Insert new custom prices
    if (servicePrices.length > 0) {
      await db.insert(customerServicePrices).values(
        servicePrices.map((sp) => ({
          id: randomUUID(),
          customer_id: customerId,
          service_id: sp.service_id,
          custom_price: sp.custom_price.toString(),
        }))
      );
    }
  } catch (error) {
    console.error("Error updating customer service prices:", error);
    throw new Error("Failed to update customer service prices");
  }
}
