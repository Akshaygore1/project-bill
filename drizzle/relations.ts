import { relations } from "drizzle-orm/relations";
import {
  user as users,
  account,
  session,
  customers,
  parties,
} from "@/db/schema";

export const accountRelations = relations(account, ({ one }) => ({
  user: one(users, {
    fields: [account.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(account),
  sessions: many(session),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(users, {
    fields: [session.userId],
    references: [users.id],
  }),
}));

export const customerRelations = relations(customers, ({ many }) => ({
  parties: many(parties),
}));

export const partyRelations = relations(parties, ({ one }) => ({
  customer: one(customers, {
    fields: [parties.customer_id],
    references: [customers.id],
  }),
}));
