"use client";

import { OrderForm } from "./order-form";
import type { Customer, Service } from "@/lib/types";
import { createOrders } from "@/app/action/order";
import { authClient } from "@/lib/auth-client";

interface OrderFormWrapperProps {
  customers: Customer[];
  services: Service[];
}

export function OrderFormWrapper({
  customers,
  services,
}: OrderFormWrapperProps) {
  const { data: session } = authClient.useSession();

  const handleCreateOrder = async (data: {
    customer_id: string;
    party_id?: string | null;
    orderItems: { service_id: string; quantity: number }[];
  }) => {
    if (!session?.user) {
      throw new Error("No session found");
    }

    await createOrders(session.user.id, data);
  };

  return (
    <OrderForm
      customers={customers}
      services={services}
      onSubmit={handleCreateOrder}
    />
  );
}
