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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Customers</h2>
          <p className="text-sm text-gray-600">{customers.length} customers</p>
        </div>
        <Button onClick={() => setShowCustomerForm(true)}>Add Customer</Button>
      </div>

      <CustomerList
        customers={customers}
        onSelectCustomer={setSelectedCustomer}
      />

      {selectedCustomer && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">
                Parties for {selectedCustomer.name}
              </h3>
              <p className="text-sm text-gray-600">{parties.length} parties</p>
            </div>
            <Button onClick={() => {}}>Add Party</Button>
          </div>
          <PartyList parties={parties} />
        </div>
      )}

      {/* Customer Modal */}
      {showCustomerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Create New Customer</h3>
            <CustomerForm
              onSubmit={async (data) => {
                await handleCreateCustomer(data);
                setShowCustomerForm(false);
              }}
            />
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setShowCustomerForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
