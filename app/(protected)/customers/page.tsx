"use client";

import { CustomerForm } from "@/components/customer-form";
import { CustomerList } from "@/components/customer-list";
import { PartyForm } from "@/components/party-form";
import { PartyList } from "@/components/party-list";
import { createCustomer, getCustomers } from "@/app/action/customer";
import { createParty, getPartiesByCustomerId } from "@/app/action/party";
import { useState, useEffect } from "react";

interface Customer {
  id: string;
  name: string;
  phone_number: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Party {
  id: string;
  name: string;
  customer_id: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [parties, setParties] = useState<Party[]>([]);

  useEffect(() => {
    loadCustomers();
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

  async function handleCreateCustomer(data: {
    name: string;
    phone_number: string;
  }) {
    await createCustomer(data);
    await loadCustomers();
  }

  async function handleCreateParty(data: {
    name: string;
    customer_id: string;
  }) {
    await createParty(data);
    await loadParties(data.customer_id);
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Create Customer</h2>
        <CustomerForm onSubmit={handleCreateCustomer} />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Customers</h2>
        <CustomerList
          customers={customers}
          onSelectCustomer={(customer) => setSelectedCustomer(customer)}
        />
      </div>

      {selectedCustomer && (
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Parties for {selectedCustomer.name}
          </h2>
          <div className="space-y-4">
            <PartyForm
              onSubmit={handleCreateParty}
              customerId={selectedCustomer.id}
            />
            <PartyList parties={parties} />
          </div>
        </div>
      )}
    </div>
  );
}
