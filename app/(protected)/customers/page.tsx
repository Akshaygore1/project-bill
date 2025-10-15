"use client";

import { CustomerList } from "@/components/customer-list";
import { PartyList } from "@/components/party-list";
import { Button } from "@/components/ui/button";
import { createCustomer, getCustomers } from "@/app/action/customer";
import { createParty, getPartiesByCustomerId } from "@/app/action/party";
import { useState, useEffect } from "react";
import CustomerModal from "@/components/customer-modal";
import PartyModal from "@/components/party-modal";
import { Customer, Party } from "@/lib/types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [parties, setParties] = useState<Party[]>([]);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [isCreatingParty, setIsCreatingParty] = useState(false);

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
    setIsCreatingCustomer(true);
    try {
      await createCustomer(data);
      await loadCustomers();
      setIsCustomerModalOpen(false);
    } catch (error) {
      console.error("Error creating customer:", error);
    } finally {
      setIsCreatingCustomer(false);
    }
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
          <Button onClick={() => setIsCustomerModalOpen(true)}>
            Add Customer
          </Button>
        </div>
        <CustomerList
          customers={customers}
          onSelectCustomer={(customer) => setSelectedCustomer(customer)}
        />
      </div>

      {/* Parties Section - shown when customer is selected */}
      {selectedCustomer && (
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
      )}

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onOpenChange={setIsCustomerModalOpen}
        onSubmit={handleCreateCustomer}
        isLoading={isCreatingCustomer}
      />

      {/* Party Modal */}
      {selectedCustomer && (
        <PartyModal
          isOpen={isPartyModalOpen}
          onOpenChange={setIsPartyModalOpen}
          customer={selectedCustomer}
          onSubmit={handleCreateParty}
          isLoading={isCreatingParty}
        />
      )}
    </div>
  );
}
