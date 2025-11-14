"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { getPartiesByCustomerId } from "@/app/action/party";
import type { Customer, Service, Party } from "@/lib/types";
import type { OrderFormProps } from "@/lib/types";
import { ChevronDown, X, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Label } from "./ui/label";

interface OrderItem {
  service_id: string;
  quantity: number;
  service?: Service;
}

export function OrderForm({ customers, services, onSubmit }: OrderFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [parties, setParties] = useState<Party[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [quantity, setQuantity] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch parties when customer is selected
  useEffect(() => {
    const fetchParties = async () => {
      if (selectedCustomer) {
        try {
          const customerParties = await getPartiesByCustomerId(
            selectedCustomer.id
          );
          setParties(customerParties);
          setSelectedParty(null); // Reset party selection when customer changes
        } catch (error) {
          console.error("Error fetching parties:", error);
          setParties([]);
        }
      } else {
        setParties([]);
        setSelectedParty(null);
      }
    };

    fetchParties();
  }, [selectedCustomer]);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const addOrderItem = () => {
    if (!selectedService || !quantity || parseInt(quantity) <= 0) return;

    const existingIndex = orderItems.findIndex(
      (item) => item.service_id === selectedService.id
    );

    if (existingIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...orderItems];
      updatedItems[existingIndex].quantity += parseInt(quantity);
      setOrderItems(updatedItems);
    } else {
      // Add new item
      setOrderItems([
        ...orderItems,
        {
          service_id: selectedService.id,
          quantity: parseInt(quantity),
          service: selectedService,
        },
      ]);
    }

    setSelectedService(null);
    setQuantity("");
    setServiceSearch("");
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || orderItems.length === 0) return;

    setIsLoading(true);
    try {
      await onSubmit({
        customer_id: selectedCustomer.id,
        party_id: selectedParty?.id || null,
        orderItems: orderItems.map((item) => ({
          service_id: item.service_id,
          quantity: item.quantity,
        })),
      });

      // Reset form
      setSelectedCustomer(null);
      setSelectedParty(null);
      setParties([]);
      setCustomerSearch("");
      setOrderItems([]);
      setSelectedService(null);
      setQuantity("");
      setServiceSearch("");
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create New Order</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div>
          <Label className="block text-sm font-medium mb-2">Customer</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between"
                type="button"
              >
                {selectedCustomer ? selectedCustomer.name : "Select Customer"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full min-w-[400px]">
              <div className="p-2">
                <Input
                  placeholder="Search customers..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="mb-2"
                />
              </div>
              {filteredCustomers.map((customer) => (
                <DropdownMenuItem
                  key={customer.id}
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setCustomerSearch("");
                  }}
                >
                  {customer.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Party Selection */}
        {selectedCustomer && parties.length > 0 && (
          <div>
            <Label className="block text-sm font-medium mb-2">
              Party (Optional)
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  type="button"
                >
                  {selectedParty
                    ? selectedParty.name
                    : "Select Party (Optional)"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full min-w-[300px]">
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedParty(null);
                  }}
                >
                  No Party (Bill to Customer)
                </DropdownMenuItem>
                {parties.map((party) => (
                  <DropdownMenuItem
                    key={party.id}
                    onClick={() => {
                      setSelectedParty(party);
                    }}
                  >
                    {party.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Service and Quantity Addition */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Add Services</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Service Selection */}
            <div>
              <Label className="block text-sm font-medium mb-1">Service</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    type="button"
                  >
                    {selectedService ? selectedService.name : "Select Service"}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full min-w-[300px]">
                  <div className="p-2">
                    <Input
                      placeholder="Search services..."
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      className="mb-2"
                    />
                  </div>
                  {filteredServices.map((service) => (
                    <DropdownMenuItem
                      key={service.id}
                      onClick={() => {
                        setSelectedService(service);
                        setServiceSearch("");
                      }}
                    >
                      {service.name} - ₹{service.price}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Quantity Input */}
            <div>
              <Label className="block text-sm font-medium mb-1">Quantity</Label>
              <Input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
              />
            </div>

            {/* Add Button */}
            <div className="flex items-end">
              <Button
                type="button"
                onClick={addOrderItem}
                disabled={!selectedService || !quantity}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Order Items List */}
        {orderItems.length > 0 && (
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Order Items</h3>
            <div className="space-y-2">
              {orderItems.map((item, index) => (
                <div
                  key={`${item.service_id}-${index}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <div>
                    <span className="font-medium">{item.service?.name}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      Quantity: {item.quantity} | Price: ₹{item.service?.price}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOrderItem(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!selectedCustomer || orderItems.length === 0 || isLoading}
          className="w-full"
        >
          {isLoading ? "Creating Order..." : "Create Order"}
        </Button>
      </form>
    </div>
  );
}
