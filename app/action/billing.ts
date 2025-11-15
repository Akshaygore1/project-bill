"use server";

import { randomUUID } from "node:crypto";
import { eq, sql, and, desc, gte, lte, sum } from "drizzle-orm";
import db from "@/db";
import {
  orders,
  customers,
  services,
  customerServicePrices,
  billingCycles,
  payments,
  user,
} from "@/db/schema";
import { getSession } from "@/lib/auth";

export interface BillingCycleWithCustomer {
  id: string;
  customer_id: string;
  billing_month: number;
  billing_year: number;
  total_amount: number;
  previous_carryover: number;
  paid_amount: number;
  remaining_balance: number;
  is_closed: boolean;
  customer?: {
    name: string;
    phone_number: string;
  };
  createdAt: Date;
}

export interface PaymentWithDetails {
  id: string;
  billing_cycle_id: string;
  amount: number;
  payment_date: Date;
  payment_method: string | null;
  notes: string | null;
  created_by: string;
  createdByUser?: {
    name: string;
  };
  createdAt: Date;
}

// Generate billing cycles for all customers for a specific month/year
export async function generateMonthlyBills(
  billingMonth: number,
  billingYear: number
) {
  try {
    const session = await getSession();
    if (!session) {
      throw new Error("Authentication required");
    }

    // Get all customers
    const allCustomers = await db.select().from(customers);

    const billingPromises = allCustomers.map(async (customer) => {
      // Calculate orders total for the month
      const monthStart = new Date(billingYear, billingMonth - 1, 1);
      const monthEnd = new Date(billingYear, billingMonth, 0, 23, 59, 59);

      const orderTotalResult = await db
        .select({
          total: sql<number>`COALESCE(SUM(COALESCE(${customerServicePrices.custom_price}, ${services.price}) * ${orders.quantity}), 0)`,
        })
        .from(orders)
        .leftJoin(services, eq(orders.service_id, services.id))
        .leftJoin(
          customerServicePrices,
          sql`${orders.customer_id} = ${customerServicePrices.customer_id} AND ${orders.service_id} = ${customerServicePrices.service_id}`
        )
        .where(
          and(
            eq(orders.customer_id, customer.id),
            gte(orders.createdAt, monthStart),
            lte(orders.createdAt, monthEnd)
          )
        );

      const monthlyOrderTotal = Number(orderTotalResult[0]?.total) || 0;

      // Get previous month's remaining balance (carryover)
      const previousMonth = billingMonth === 1 ? 12 : billingMonth - 1;
      const previousYear = billingMonth === 1 ? billingYear - 1 : billingYear;

      const previousBillingCycle = await db
        .select()
        .from(billingCycles)
        .where(
          and(
            eq(billingCycles.customer_id, customer.id),
            eq(billingCycles.billing_month, previousMonth),
            eq(billingCycles.billing_year, previousYear)
          )
        )
        .limit(1);

      const previousCarryover =
        previousBillingCycle.length > 0
          ? Number(previousBillingCycle[0].remaining_balance)
          : 0;

      const totalAmount = monthlyOrderTotal + previousCarryover;

      // Check if billing cycle already exists
      const existingCycle = await db
        .select()
        .from(billingCycles)
        .where(
          and(
            eq(billingCycles.customer_id, customer.id),
            eq(billingCycles.billing_month, billingMonth),
            eq(billingCycles.billing_year, billingYear)
          )
        )
        .limit(1);

      if (existingCycle.length > 0) {
        // Update existing cycle
        await db
          .update(billingCycles)
          .set({
            total_amount: totalAmount.toString(),
            previous_carryover: previousCarryover.toString(),
            remaining_balance: (
              totalAmount - Number(existingCycle[0].paid_amount)
            ).toString(),
            updatedAt: new Date(),
          })
          .where(eq(billingCycles.id, existingCycle[0].id));
      } else {
        // Create new billing cycle
        await db.insert(billingCycles).values({
          id: randomUUID(),
          customer_id: customer.id,
          billing_month: billingMonth,
          billing_year: billingYear,
          total_amount: totalAmount.toString(),
          previous_carryover: previousCarryover.toString(),
          paid_amount: "0",
          remaining_balance: totalAmount.toString(),
          is_closed: false,
        });
      }
    });

    await Promise.all(billingPromises);
    return { success: true, message: "Billing cycles generated successfully" };
  } catch (error) {
    console.error("Error generating monthly bills:", error);
    throw new Error("Failed to generate monthly bills");
  }
}

// Get all billing cycles with customer details
export async function getBillingCycles(): Promise<BillingCycleWithCustomer[]> {
  try {
    const result = await db
      .select({
        id: billingCycles.id,
        customer_id: billingCycles.customer_id,
        billing_month: billingCycles.billing_month,
        billing_year: billingCycles.billing_year,
        total_amount: billingCycles.total_amount,
        previous_carryover: billingCycles.previous_carryover,
        paid_amount: billingCycles.paid_amount,
        remaining_balance: billingCycles.remaining_balance,
        is_closed: billingCycles.is_closed,
        createdAt: billingCycles.createdAt,
        customer: {
          name: customers.name,
          phone_number: customers.phone_number,
        },
      })
      .from(billingCycles)
      .leftJoin(customers, eq(billingCycles.customer_id, customers.id))
      .orderBy(desc(billingCycles.createdAt));

    return result.map((row) => ({
      ...row,
      total_amount: Number(row.total_amount),
      previous_carryover: Number(row.previous_carryover),
      paid_amount: Number(row.paid_amount),
      remaining_balance: Number(row.remaining_balance),
      customer: row.customer || undefined,
    }));
  } catch (error) {
    console.error("Error fetching billing cycles:", error);
    throw new Error("Failed to fetch billing cycles");
  }
}

// Record a payment
export async function recordPayment(
  billingCycleId: string,
  amount: number,
  paymentMethod: string,
  notes: string | null
) {
  try {
    const session = await getSession();
    if (!session) {
      throw new Error("Authentication required");
    }
    // Get current billing cycle
    const billingCycle = await db
      .select()
      .from(billingCycles)
      .where(eq(billingCycles.id, billingCycleId))
      .limit(1);

    if (billingCycle.length === 0) {
      throw new Error("Billing cycle not found");
    }

    const currentCycle = billingCycle[0];
    const currentPaidAmount = Number(currentCycle.paid_amount);
    const newPaidAmount = currentPaidAmount + amount;
    const remainingBalance = Number(currentCycle.total_amount) - newPaidAmount;

    // Create payment record
    await db.insert(payments).values({
      id: randomUUID(),
      billing_cycle_id: billingCycleId,
      amount: amount.toString(),
      payment_method: paymentMethod,
      notes: notes,
      created_by: session.user.id,
    });

    // Update billing cycle
    await db
      .update(billingCycles)
      .set({
        paid_amount: newPaidAmount.toString(),
        remaining_balance: Math.max(0, remainingBalance).toString(),
        is_closed: remainingBalance <= 0,
        updatedAt: new Date(),
      })
      .where(eq(billingCycles.id, billingCycleId));

    return { success: true, message: "Payment recorded successfully" };
  } catch (error) {
    console.error("Error recording payment:", error);
    throw new Error("Failed to record payment");
  }
}

// Get payments for a billing cycle
export async function getPaymentsForBillingCycle(
  billingCycleId: string
): Promise<PaymentWithDetails[]> {
  try {
    const result = await db
      .select({
        id: payments.id,
        billing_cycle_id: payments.billing_cycle_id,
        amount: payments.amount,
        payment_date: payments.payment_date,
        payment_method: payments.payment_method,
        notes: payments.notes,
        created_by: payments.created_by,
        createdAt: payments.createdAt,
        createdByUser: {
          name: user.name,
        },
      })
      .from(payments)
      .leftJoin(user, eq(payments.created_by, user.id))
      .where(eq(payments.billing_cycle_id, billingCycleId))
      .orderBy(desc(payments.createdAt));

    return result.map((row) => ({
      ...row,
      amount: Number(row.amount),
      createdByUser: row.createdByUser || undefined,
    }));
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw new Error("Failed to fetch payments");
  }
}

// Get billing summary for dashboard
export interface BillingSummary {
  totalOutstanding: number;
  totalPaid: number;
  totalBilled: number;
  overdueCount: number;
}

export async function getBillingSummary(): Promise<BillingSummary> {
  try {
    const result = await db
      .select({
        totalOutstanding: sql<number>`COALESCE(SUM(CAST(${billingCycles.remaining_balance} AS DECIMAL)), 0)`,
        totalPaid: sql<number>`COALESCE(SUM(CAST(${billingCycles.paid_amount} AS DECIMAL)), 0)`,
        totalBilled: sql<number>`COALESCE(SUM(CAST(${billingCycles.total_amount} AS DECIMAL)), 0)`,
      })
      .from(billingCycles);

    // Count overdue bills (more than 30 days old with remaining balance > 0)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const overdueResult = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(billingCycles)
      .where(
        and(
          sql`CAST(${billingCycles.remaining_balance} AS DECIMAL) > 0`,
          lte(billingCycles.createdAt, thirtyDaysAgo)
        )
      );

    return {
      totalOutstanding: Number(result[0]?.totalOutstanding) || 0,
      totalPaid: Number(result[0]?.totalPaid) || 0,
      totalBilled: Number(result[0]?.totalBilled) || 0,
      overdueCount: Number(overdueResult[0]?.count) || 0,
    };
  } catch (error) {
    console.error("Error fetching billing summary:", error);
    throw new Error("Failed to fetch billing summary");
  }
}

// Get month-on-month order totals for a customer
export async function getCustomerMonthlyOrders(customerId: string): Promise<{
  customerName: string;
  monthlyTotals: Array<{
    month: number;
    year: number;
    monthName: string;
    totalAmount: number;
    orderCount: number;
  }>;
}> {
  try {
    const session = await getSession();
    if (!session) {
      throw new Error("Authentication required");
    }

    // Get customer details
    const customerResult = await db
      .select({
        name: customers.name,
      })
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);

    if (customerResult.length === 0) {
      throw new Error("Customer not found");
    }

    const customerName = customerResult[0].name;

    // Get monthly order totals for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyOrdersResult = await db
      .select({
        year: sql<number>`EXTRACT(YEAR FROM ${orders.createdAt})`,
        month: sql<number>`EXTRACT(MONTH FROM ${orders.createdAt})`,
        totalAmount: sql<number>`COALESCE(SUM(COALESCE(${customerServicePrices.custom_price}, ${services.price}) * ${orders.quantity}), 0)`,
        orderCount: sql<number>`COUNT(${orders.id})`,
      })
      .from(orders)
      .leftJoin(services, eq(orders.service_id, services.id))
      .leftJoin(
        customerServicePrices,
        sql`${orders.customer_id} = ${customerServicePrices.customer_id} AND ${orders.service_id} = ${customerServicePrices.service_id}`
      )
      .where(
        and(
          eq(orders.customer_id, customerId),
          gte(orders.createdAt, twelveMonthsAgo)
        )
      )
      .groupBy(
        sql`EXTRACT(YEAR FROM ${orders.createdAt})`,
        sql`EXTRACT(MONTH FROM ${orders.createdAt})`
      )
      .orderBy(
        sql`EXTRACT(YEAR FROM ${orders.createdAt})`,
        sql`EXTRACT(MONTH FROM ${orders.createdAt})`
      );

    // Convert month numbers to names and format the data
    const monthlyTotals = monthlyOrdersResult.map((row) => ({
      month: row.month,
      year: row.year,
      monthName: new Date(row.year, row.month - 1).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      totalAmount: Number(row.totalAmount),
      orderCount: Number(row.orderCount),
    }));

    return {
      customerName,
      monthlyTotals,
    };
  } catch (error) {
    console.error("Error fetching customer monthly orders:", error);
    throw new Error("Failed to fetch customer monthly orders");
  }
}

// Get current month's billing cycles
export async function getCurrentMonthBills(): Promise<
  BillingCycleWithCustomer[]
> {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  try {
    const result = await db
      .select({
        id: billingCycles.id,
        customer_id: billingCycles.customer_id,
        billing_month: billingCycles.billing_month,
        billing_year: billingCycles.billing_year,
        total_amount: billingCycles.total_amount,
        previous_carryover: billingCycles.previous_carryover,
        paid_amount: billingCycles.paid_amount,
        remaining_balance: billingCycles.remaining_balance,
        is_closed: billingCycles.is_closed,
        createdAt: billingCycles.createdAt,
        customer: {
          name: customers.name,
          phone_number: customers.phone_number,
        },
      })
      .from(billingCycles)
      .leftJoin(customers, eq(billingCycles.customer_id, customers.id))
      .where(
        and(
          eq(billingCycles.billing_month, currentMonth),
          eq(billingCycles.billing_year, currentYear)
        )
      )
      .orderBy(customers.name);

    return result.map((row) => ({
      ...row,
      total_amount: Number(row.total_amount),
      previous_carryover: Number(row.previous_carryover),
      paid_amount: Number(row.paid_amount),
      remaining_balance: Number(row.remaining_balance),
      customer: row.customer || undefined,
    }));
  } catch (error) {
    console.error("Error fetching current month bills:", error);
    throw new Error("Failed to fetch current month bills");
  }
}
