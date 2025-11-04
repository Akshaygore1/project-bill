"use client";
import { createCustomer } from "@/app/action/customer";
import { getServices } from "@/app/action/service";
import ClientForm from "@/components/client-form";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Service } from "@/lib/types";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function CreateCustomerPage() {
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    address: "",
    payment_due_date: undefined as number | undefined,
    servicePrices: undefined as
      | { service_id: string; custom_price: number }[]
      | undefined,
  });

  useEffect(() => {
    async function fetchServices() {
      try {
        const servicesData = await getServices();
        setServices(servicesData);
      } catch (error) {
        console.error("Error fetching services:", error);
        toast.error("Failed to fetch services");
      }
    }
    fetchServices();
  }, []);

  async function handleCreateCustomer(data: {
    name: string;
    phone_number: string;
    address?: string;
    payment_due_date?: number;
    servicePrices?: { service_id: string; custom_price: number }[];
  }) {
    setIsCreatingCustomer(true);
    try {
      await createCustomer(data);
      toast.success("Customer created successfully!");
      router.push("/customers");
    } catch (error) {
      console.error("Error creating customer:", error);
      toast.error("Failed to create customer");
    } finally {
      setIsCreatingCustomer(false);
    }
  }

  const handleFormChange = (
    field: string,
    value:
      | string
      | number
      | undefined
      | { service_id: string; custom_price: number }[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  return (
    <div className="flex flex-col gap-8 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold text-foreground">
            Create Customer
          </h1>
          <p className="text-sm text-muted-foreground">
            Fill in customer details and optionally set custom service prices.
          </p>
        </div>
        <Link
          href="/customers"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Customers</span>
        </Link>
      </div>

      <ClientForm
        onSubmit={handleCreateCustomer}
        formData={formData}
        onFormChange={handleFormChange}
        isLoading={isCreatingCustomer}
        services={services}
      />
    </div>
  );
}
