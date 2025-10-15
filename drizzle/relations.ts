import { relations } from "drizzle-orm/relations";
import {
  user as users,
  account,
  session,
  customers,
  parties,
  orders,
  services,
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
  orders: many(orders),
}));

export const partyRelations = relations(parties, ({ one }) => ({
  customer: one(customers, {
    fields: [parties.customer_id],
    references: [customers.id],
  }),
}));

export const serviceRelations = relations(services, ({ many }) => ({
  orders: many(orders),
}));

export const orderRelations = relations(orders, ({ one }) => ({
  customer: one(customers, {
    fields: [orders.customer_id],
    references: [customers.id],
  }),
  service: one(services, {
    fields: [orders.service_id],
    references: [services.id],
  }),
  createdByUser: one(users, {
    fields: [orders.created_by],
    references: [users.id],
  }),
}));
