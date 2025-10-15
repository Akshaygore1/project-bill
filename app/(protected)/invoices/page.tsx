"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getGroupedOrdersByCreator,
  getGroupedOrdersByCustomer,
  getGroupedOrdersByCreatorAndCustomer,
} from "@/app/action/order";
import {
  handleCreateInvoice,
  handleCreateInvoiceForCreatorCustomer,
  handleCreateInvoiceForCustomer,
} from "@/lib/invoice-utils";
import { useState, useEffect } from "react";
import {
  CreatorOrderGroup,
  CustomerOrderGroup,
  CreatorCustomerOrderGroup,
} from "@/lib/types";
import { FileText, Users, User, UserCheck } from "lucide-react";

export default function InvoicesPage() {
  const [creatorGroups, setCreatorGroups] = useState<CreatorOrderGroup[]>([]);
  const [customerGroups, setCustomerGroups] = useState<CustomerOrderGroup[]>(
    []
  );
  const [creatorCustomerGroups, setCreatorCustomerGroups] = useState<
    CreatorCustomerOrderGroup[]
  >([]);
  const [isLoadingCreators, setIsLoadingCreators] = useState(true);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [isLoadingCreatorCustomers, setIsLoadingCreatorCustomers] =
    useState(true);

  useEffect(() => {
    loadAllGroups();
  }, []);

  async function loadAllGroups() {
    try {
      // Load creator groups
      setIsLoadingCreators(true);
      const creatorData = await getGroupedOrdersByCreator();
      setCreatorGroups(creatorData);
    } catch (error) {
      console.error("Error loading creator groups:", error);
    } finally {
      setIsLoadingCreators(false);
    }

    try {
      // Load customer groups
      setIsLoadingCustomers(true);
      const customerData = await getGroupedOrdersByCustomer();
      setCustomerGroups(customerData);
    } catch (error) {
      console.error("Error loading customer groups:", error);
    } finally {
      setIsLoadingCustomers(false);
    }

    try {
      // Load creator-customer groups
      setIsLoadingCreatorCustomers(true);
      const creatorCustomerData = await getGroupedOrdersByCreatorAndCustomer();
      setCreatorCustomerGroups(creatorCustomerData);
    } catch (error) {
      console.error("Error loading creator-customer groups:", error);
    } finally {
      setIsLoadingCreatorCustomers(false);
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Invoice Generation</h1>
          <p className="text-sm text-gray-600">
            Generate invoices based on different grouping criteria
          </p>
        </div>
      </div>

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Per Customer
          </TabsTrigger>
          <TabsTrigger value="creators" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Per Creator
          </TabsTrigger>
          <TabsTrigger
            value="creator-customer"
            className="flex items-center gap-2"
          >
            <UserCheck className="h-4 w-4" />
            Per Creator-Customer
          </TabsTrigger>
        </TabsList>

        {/* Customer Invoices Tab */}
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer-Based Invoices
              </CardTitle>
              <CardDescription>
                Generate one invoice per customer containing all their orders
                from different creators
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCustomers ? (
                <div className="text-center py-8">
                  <div className="text-lg">Loading customer groups...</div>
                </div>
              ) : customerGroups.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No customer groups found.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {customerGroups.map((group) => (
                    <Card key={group.customerId} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {group.customerName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {group.orderCount} orders •{" "}
                            {formatCurrency(group.totalAmount)}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleCreateInvoiceForCustomer(group)}
                          className="flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          Generate Invoice
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Creator Invoices Tab */}
        <TabsContent value="creators" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Creator-Based Invoices
              </CardTitle>
              <CardDescription>
                Generate one invoice per creator containing all their orders for
                different customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCreators ? (
                <div className="text-center py-8">
                  <div className="text-lg">Loading creator groups...</div>
                </div>
              ) : creatorGroups.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No creator groups found.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {creatorGroups.map((group) => (
                    <Card key={group.creatorId} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {group.creatorName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {group.orderCount} orders •{" "}
                            {formatCurrency(group.totalAmount)}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleCreateInvoice(group)}
                          className="flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          Generate Invoice
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Creator-Customer Invoices Tab */}
        <TabsContent value="creator-customer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Creator-Customer Combination Invoices
              </CardTitle>
              <CardDescription>
                Generate separate invoices for each creator-customer combination
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCreatorCustomers ? (
                <div className="text-center py-8">
                  <div className="text-lg">
                    Loading creator-customer groups...
                  </div>
                </div>
              ) : creatorCustomerGroups.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No creator-customer groups found.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {creatorCustomerGroups.map((group) => (
                    <Card
                      key={`${group.creatorId}-${group.customerId}`}
                      className="p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {group.creatorName} → {group.customerName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {group.orderCount} orders •{" "}
                            {formatCurrency(group.totalAmount)}
                          </p>
                        </div>
                        <Button
                          onClick={() =>
                            handleCreateInvoiceForCreatorCustomer(group)
                          }
                          className="flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          Generate Invoice
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
