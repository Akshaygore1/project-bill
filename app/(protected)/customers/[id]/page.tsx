import { notFound } from "next/navigation";
import { getCustomerById } from "@/app/action/customer";
import { getCustomerOrders } from "@/app/action/order";
import { CustomerProfileClient } from "@/components/customer-profile-client";

export default async function CustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [customer, orders] = await Promise.all([
    getCustomerById(id),
    getCustomerOrders(id),
  ]);

  if (!customer) {
    notFound();
  }

  return <CustomerProfileClient customer={customer} orders={orders} />;
}