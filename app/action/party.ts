"use server";

import db from "@/db";
import { parties } from "@/db/schema";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

export async function createParty(data: { name: string; customer_id: string }) {
  try {
    const party = await db
      .insert(parties)
      .values({
        id: randomUUID(),
        name: data.name,
        customer_id: data.customer_id,
      })
      .returning();
    return party[0];
  } catch (error) {
    console.error("Error creating party:", error);
    throw new Error("Failed to create party");
  }
}

export async function deleteParty(partyId: string) {
  try {
    await db.delete(parties).where(eq(parties.id, partyId));
    return true;
  } catch (error) {
    console.error("Error deleting party:", error);
    throw new Error("Failed to delete party");
  }
}

export async function getPartiesByCustomerId(customerId: string) {
  try {
    return await db
      .select()
      .from(parties)
      .where(eq(parties.customer_id, customerId))
      .orderBy(parties.createdAt);
  } catch (error) {
    console.error("Error fetching parties:", error);
    throw new Error("Failed to fetch parties");
  }
}

export async function getAllParties() {
  try {
    return await db.select().from(parties).orderBy(parties.createdAt);
  } catch (error) {
    console.error("Error fetching parties:", error);
    throw new Error("Failed to fetch parties");
  }
}
