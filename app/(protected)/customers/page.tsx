"use client";

import { CustomerList } from "@/components/customer-list";
import { getCustomers, deleteCustomer } from "@/app/action/customer";
import {
  getGroupedOrdersByCustomer,
  type CustomerOrderGroup,
} from "@/app/action/order";
import { useState, useEffect } from "react";
import type { Customer } from "@/lib/types";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerBilling, setCustomerBilling] = useState<CustomerOrderGroup[]>(
    []
  );
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    loadCustomers();
    loadCustomerBilling();
  }, []);

  async function loadCustomers() {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  }

  async function loadCustomerBilling() {
    try {
      const data = await getGroupedOrdersByCustomer();
      setCustomerBilling(data);
    } catch (error) {
      console.error("Error loading customer billing:", error);
    }
  }

  async function handleDeleteCustomer() {
    if (!customerToDelete) return;

    try {
      await deleteCustomer(customerToDelete.id);
      await loadCustomers();
      await loadCustomerBilling();
      setDeleteModalOpen(false);
      setCustomerToDelete(null);
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  }

  function openDeleteModal(customer: Customer) {
    setCustomerToDelete(customer);
    setDeleteModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                Manage Clients
              </h1>
              <p className="text-slate-600 mt-2">
                View and manage all your customer accounts and billing
              </p>
            </div>
            <Link
              href="/customers/create"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm w-full sm:w-auto"
            >
              <Plus size={20} /> Add Client
            </Link>
          </div>
        </div>

        <div>
          <div className="p-8">
            <CustomerList
              customers={customers}
              customerBilling={customerBilling}
              onSelectCustomer={(customer) => setSelectedCustomer(customer)}
              onDeleteCustomer={openDeleteModal}
            />
          </div>
        </div>
      </div>

      {/* Delete Customer Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Delete Customer
            </DialogTitle>
            <DialogDescription className="text-slate-600 mt-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-900">
                "{customerToDelete?.name}"
              </span>
              ? This action cannot be undone and will remove all associated data
              including service prices and billing information.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setCustomerToDelete(null);
              }}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCustomer}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
