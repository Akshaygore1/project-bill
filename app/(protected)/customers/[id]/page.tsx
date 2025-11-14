import { notFound } from "next/navigation";
import { getCustomerById } from "@/app/action/customer";
import { getCustomerOrders } from "@/app/action/order";
import { getPartiesByCustomerId } from "@/app/action/party";
import { CustomerProfileClient } from "@/components/customer-profile-client";

export default async function CustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [customer, orders, parties] = await Promise.all([
    getCustomerById(id),
    getCustomerOrders(id),
    getPartiesByCustomerId(id),
  ]);

  if (!customer) {
    notFound();
  }

  return (
    <CustomerProfileClient
      customer={customer}
      orders={orders}
      parties={parties}
    />
  );
}
