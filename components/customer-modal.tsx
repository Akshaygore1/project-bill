"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Customer, Service } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CustomerModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
  services?: Service[];
  existingServicePrices?: { service_id: string; custom_price: number }[];
  onSubmit: (data: { 
    name: string; 
    phone_number: string;
    address?: string;
    payment_due_date?: number;
    servicePrices?: { service_id: string; custom_price: number }[];
  }) => Promise<void>;
  isLoading: boolean;
}

export default function CustomerModal({
  isOpen,
  onOpenChange,
  customer,
  services = [],
  existingServicePrices = [],
  onSubmit,
  isLoading,
}: CustomerModalProps) {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [paymentDueDate, setPaymentDueDate] = useState<number | "">("");
  const [servicePrices, setServicePrices] = useState<Record<string, number>>({});

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhoneNumber(customer.phone_number);
      setAddress(customer.address || "");
      setPaymentDueDate(customer.payment_due_date || "");
    } else {
      setName("");
      setPhoneNumber("");
      setAddress("");
      setPaymentDueDate("");
    }
    
    // Set existing service prices
    const pricesMap: Record<string, number> = {};
    existingServicePrices.forEach(sp => {
      pricesMap[sp.service_id] = sp.custom_price;
    });
    setServicePrices(pricesMap);
  }, [customer, isOpen, existingServicePrices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert servicePrices object to array
    const servicePricesArray = Object.entries(servicePrices)
      .filter(([_, price]) => price > 0)
      .map(([service_id, custom_price]) => ({ service_id, custom_price }));
    
    await onSubmit({ 
      name, 
      phone_number: phoneNumber,
      address: address || undefined,
      payment_due_date: paymentDueDate || undefined,
      servicePrices: servicePricesArray.length > 0 ? servicePricesArray : undefined,
    });
    
    if (!customer) {
      setName("");
      setPhoneNumber("");
      setAddress("");
      setPaymentDueDate("");
      setServicePrices({});
    }
  };
  
  const handleServicePriceChange = (serviceId: string, price: string) => {
    const numPrice = parseFloat(price);
    if (!isNaN(numPrice) && numPrice >= 0) {
      setServicePrices(prev => ({ ...prev, [serviceId]: numPrice }));
    } else if (price === "") {
      setServicePrices(prev => {
        const newPrices = { ...prev };
        delete newPrices[serviceId];
        return newPrices;
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {customer ? "Edit Customer" : "Create New Customer"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Customer Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Customer Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Customer Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="dueDate">Payment Due Date (Day of Month)</Label>
            <Input
              id="dueDate"
              type="number"
              min="1"
              max="31"
              placeholder="e.g., 15 for 15th of every month"
              value={paymentDueDate}
              onChange={(e) => setPaymentDueDate(e.target.value ? parseInt(e.target.value) : "")}
            />
            <p className="text-xs text-gray-500 mt-1">Enter a day between 1-31</p>
          </div>
          
          {services.length > 0 && (
            <div className="space-y-3">
              <Label>Custom Service Prices (Optional)</Label>
              <p className="text-xs text-gray-500">
                Set custom prices for this customer. Leave blank to use default prices.
              </p>
              <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-3">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center gap-3">
                    <Label className="flex-1 text-sm">{service.name}</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        Default: ${service.price.toFixed(2)}
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={service.price.toFixed(2)}
                        value={servicePrices[service.id] || ""}
                        onChange={(e) => handleServicePriceChange(service.id, e.target.value)}
                        className="w-24"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : customer ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
