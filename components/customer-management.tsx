"use client";

import { useState, useEffect } from "react";
import { CustomerForm } from "./customer-form";
import { CustomerList } from "./customer-list";
import { PartyForm } from "./party-form";
import { PartyList } from "./party-list";
import { createCustomer, getCustomers } from "@/app/action/customer";
import { createParty, getPartiesByCustomerId } from "@/app/action/party";
import { Button } from "./ui/button";
import { Customer, Party } from "@/lib/types";

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [parties, setParties] = useState<Party[]>([]);

  const [showCustomerForm, setShowCustomerForm] = useState(false);

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
    setShowCustomerForm(false);
  }

  async function handleCreateParty(data: {
    name: string;
    customer_id: string;
  }) {
    await createParty(data);
    await loadParties(data.customer_id);
  }

  return (
    <div className="w-full max-w-4xl space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customer Management</h2>
        <Button onClick={() => setShowCustomerForm(!showCustomerForm)}>
          {showCustomerForm ? "Cancel" : "Add Customer"}
        </Button>
      </div>

      {showCustomerForm && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Create New Customer</h3>
          <CustomerForm onSubmit={handleCreateCustomer} />
        </div>
      )}

      <div>
        <CustomerList
          customers={customers}
          onSelectCustomer={setSelectedCustomer}
        />
      </div>

      {selectedCustomer && (
        <div className="p-4 border rounded-lg">
          <h3 className="text-xl font-bold mb-4">
            Parties for {selectedCustomer.name}
          </h3>
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
