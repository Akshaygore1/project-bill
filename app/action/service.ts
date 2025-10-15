"use server";

import db from "@/db";
import { services } from "@/db/schema";
import { randomUUID } from "crypto";

export async function createService(data: { name: string; price: number }) {
  try {
    const service = await db
      .insert(services)
      .values({
        id: randomUUID(),
        name: data.name,
        price: data.price.toString(),
      })
      .returning();
    return service[0];
  } catch (error) {
    console.error("Error creating service:", error);
    throw new Error("Failed to create service");
  }
}

export async function getServices() {
  try {
    const result = await db.select().from(services).orderBy(services.createdAt);
    return result.map((service) => ({
      ...service,
      price: parseFloat(service.price),
    }));
  } catch (error) {
    console.error("Error fetching services:", error);
    throw new Error("Failed to fetch services");
  }
}
