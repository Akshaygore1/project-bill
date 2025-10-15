"use client";

import { PartyList } from "@/components/party-list";
import { Button } from "@/components/ui/button";
import { createParty, getAllParties } from "@/app/action/party";
import { getCustomers } from "@/app/action/customer";
import { useState, useEffect } from "react";
import PartyModal from "@/components/party-modal";
import { Customer, Party } from "@/lib/types";

export default function PartiesPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [isCreatingParty, setIsCreatingParty] = useState(false);

  useEffect(() => {
    loadParties();
    loadCustomers();
  }, []);

  async function loadParties() {
    try {
      const data = await getAllParties();
      setParties(data);
    } catch (error) {
      console.error("Error loading parties:", error);
    }
  }

  async function loadCustomers() {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  }

  async function handleCreateParty(data: {
    name: string;
    customer_id: string;
  }) {
    setIsCreatingParty(true);
    try {
      await createParty(data);
      await loadParties();
      setIsPartyModalOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      console.error("Error creating party:", error);
    } finally {
      setIsCreatingParty(false);
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Parties Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Parties</h1>
            <p className="text-sm text-gray-600">{parties.length} parties</p>
          </div>
          <Button onClick={() => setIsPartyModalOpen(true)}>Add Party</Button>
        </div>
        <PartyList parties={parties} />
      </div>

      {/* Party Modal */}
      {selectedCustomer && (
        <PartyModal
          isOpen={isPartyModalOpen}
          onOpenChange={(open) => {
            setIsPartyModalOpen(open);
            if (!open) setSelectedCustomer(null);
          }}
          customer={selectedCustomer}
          onSubmit={handleCreateParty}
          isLoading={isCreatingParty}
        />
      )}

      {/* Customer Selection Modal for Party Creation */}
      {isPartyModalOpen && !selectedCustomer && customers.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Select Customer</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {customers.map((customer) => (
                <Button
                  key={customer.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  {customer.name} - {customer.phone_number}
                </Button>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setIsPartyModalOpen(false)}
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
