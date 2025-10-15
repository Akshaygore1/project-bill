"use server";

import db from "@/db";
import { customers } from "@/db/schema";
import { randomUUID } from "crypto";

export async function createCustomer(data: {
  name: string;
  phone_number: string;
}) {
  try {
    const customer = await db
      .insert(customers)
      .values({
        id: randomUUID(),
        name: data.name,
        phone_number: data.phone_number,
      })
      .returning();
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
