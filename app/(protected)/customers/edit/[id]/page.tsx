"use client";
import { editCustomer, getCustomerById, getCustomerServicePrices } from "@/app/action/customer";
import { getServices } from "@/app/action/service";
import ClientForm from "@/components/client-form";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Service } from "@/lib/types";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [isUpdatingCustomer, setIsUpdatingCustomer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
    async function fetchData() {
      try {
        setIsLoading(true);
        const [customer, servicesData, customerServicePrices] = await Promise.all([
          getCustomerById(id),
          getServices(),
          getCustomerServicePrices(id),
        ]);

        if (!customer) {
          toast.error("Customer not found");
          router.push("/customers");
          return;
        }

        setServices(servicesData);
        setFormData({
          name: customer.name,
          phone_number: customer.phone_number,
          address: customer.address || "",
          payment_due_date: customer.payment_due_date || undefined,
          servicePrices: customerServicePrices.map((sp) => ({
            service_id: sp.service_id,
            custom_price: sp.custom_price,
          })),
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch customer data");
        router.push("/customers");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id, router]);

  async function handleEditCustomer(data: {
    name: string;
    phone_number: string;
    address?: string;
    payment_due_date?: number;
    servicePrices?: { service_id: string; custom_price: number }[];
  }) {
    setIsUpdatingCustomer(true);
    try {
      await editCustomer(id, data);
      toast.success("Customer updated successfully!");
      router.push("/customers");
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error("Failed to update customer");
    } finally {
      setIsUpdatingCustomer(false);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading customer data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold text-foreground">
            Edit Customer
          </h1>
          <p className="text-sm text-muted-foreground">
            Update customer details and custom service prices.
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
        onSubmit={handleEditCustomer}
        formData={formData}
        onFormChange={handleFormChange}
        isLoading={isUpdatingCustomer}
        services={services}
        isEditMode={true}
      />
    </div>
  );
}
