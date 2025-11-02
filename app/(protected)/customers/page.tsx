"use client";

import { CustomerList } from "@/components/customer-list";
import { PartyList } from "@/components/party-list";
import { Button } from "@/components/ui/button";
import { createCustomer, getCustomers, getCustomerServicePrices } from "@/app/action/customer";
import { createParty, getPartiesByCustomerId } from "@/app/action/party";
import { getServices } from "@/app/action/service";
import { useState, useEffect } from "react";
import CustomerModal from "@/components/customer-modal";
import PartyModal from "@/components/party-modal";
import { Customer, Party, Service } from "@/lib/types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [parties, setParties] = useState<Party[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customerServicePrices, setCustomerServicePrices] = useState<{ service_id: string; custom_price: number }[]>([]);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [isCreatingParty, setIsCreatingParty] = useState(false);

  useEffect(() => {
    loadCustomers();
    loadServices();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      loadParties(selectedCustomer.id);
    }
  }, [selectedCustomer]);

  async function loadCustomers() {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  }

  async function loadParties(customerId: string) {
    try {
      const data = await getPartiesByCustomerId(customerId);
      setParties(data);
    } catch (error) {
      console.error("Error loading parties:", error);
    }
  }

  async function loadServices() {
    try {
      const data = await getServices();
      setServices(data);
    } catch (error) {
      console.error("Error loading services:", error);
    }
  }

  async function loadCustomerServicePrices(customerId: string) {
    try {
      const data = await getCustomerServicePrices(customerId);
      setCustomerServicePrices(data.map(d => ({ service_id: d.service_id, custom_price: d.custom_price })));
    } catch (error) {
      console.error("Error loading customer service prices:", error);
      setCustomerServicePrices([]);
    }
  }

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
      await loadCustomers();
      setIsCustomerModalOpen(false);
      setCustomerServicePrices([]);
    } catch (error) {
      console.error("Error creating customer:", error);
    } finally {
      setIsCreatingCustomer(false);
    }
  }

  function handleOpenCustomerModal() {
    setCustomerServicePrices([]);
    setIsCustomerModalOpen(true);
  }

  async function handleCreateParty(data: {
    name: string;
    customer_id: string;
  }) {
    setIsCreatingParty(true);
    try {
      await createParty(data);
      await loadParties(data.customer_id);
      setIsPartyModalOpen(false);
    } catch (error) {
      console.error("Error creating party:", error);
    } finally {
      setIsCreatingParty(false);
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Customers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customers</h1>
            <p className="text-sm text-gray-600">
              {customers.length} customers
            </p>
          </div>
          <Button onClick={handleOpenCustomerModal}>
            Add Customer
          </Button>
        </div>
        <CustomerList
          customers={customers}
          onSelectCustomer={(customer) => setSelectedCustomer(customer)}
        />
      </div>

      {/* Parties Section - shown when customer is selected */}
      {/* {selectedCustomer && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Parties for {selectedCustomer.name}
              </h2>
              <p className="text-sm text-gray-600">{parties.length} parties</p>
            </div>
            <Button onClick={() => setIsPartyModalOpen(true)}>Add Party</Button>
          </div>
          <PartyList parties={parties} />
        </div>
      )} */}

      {/* Customer Modal */}
      {/* <CustomerModal
        isOpen={isCustomerModalOpen}
        onOpenChange={setIsCustomerModalOpen}
        services={services}
        existingServicePrices={customerServicePrices}
        onSubmit={handleCreateCustomer}
        isLoading={isCreatingCustomer}
      /> */}

      {/* Party Modal */}
      {/* {selectedCustomer && (
        <PartyModal
          isOpen={isPartyModalOpen}
          onOpenChange={setIsPartyModalOpen}
          customer={selectedCustomer}
          onSubmit={handleCreateParty}
          isLoading={isCreatingParty}
        />
      )} */}
    </div>
  );
}
