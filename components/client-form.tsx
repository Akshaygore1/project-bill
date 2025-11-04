"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import type { CustomerFormProps, Service } from "@/lib/types";
import { ChevronDown, X, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface ServicePrice {
  service_id: string;
  custom_price: number;
  service?: Service;
}

const ClientForm = ({
  onSubmit,
  formData,
  onFormChange,
  isLoading,
  services = [],
  isEditMode = false,
}: CustomerFormProps) => {
  const [serviceSearch, setServiceSearch] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [customPrice, setCustomPrice] = useState("");
  const [servicePrices, setServicePrices] = useState<ServicePrice[]>([]);

  // Initialize servicePrices from formData when it changes
  useEffect(() => {
    if (formData.servicePrices && services.length > 0) {
      const enrichedPrices = formData.servicePrices.map((sp) => ({
        service_id: sp.service_id,
        custom_price: sp.custom_price,
        service: services.find((s) => s.id === sp.service_id),
      }));
      setServicePrices(enrichedPrices);
    }
  }, [formData.servicePrices, services]);

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const addServicePrice = () => {
    if (!selectedService || !customPrice || Number.parseFloat(customPrice) <= 0)
      return;

    const existingIndex = servicePrices.findIndex(
      (item) => item.service_id === selectedService.id
    );

    let updatedPrices: ServicePrice[];

    if (existingIndex >= 0) {
      updatedPrices = [...servicePrices];
      updatedPrices[existingIndex] = {
        service_id: selectedService.id,
        custom_price: Number.parseFloat(customPrice),
        service: selectedService,
      };
    } else {
      updatedPrices = [
        ...servicePrices,
        {
          service_id: selectedService.id,
          custom_price: Number.parseFloat(customPrice),
          service: selectedService,
        },
      ];
    }

    setServicePrices(updatedPrices);
    onFormChange("servicePrices", updatedPrices);
    setSelectedService(null);
    setCustomPrice("");
    setServiceSearch("");
  };

  const removeServicePrice = (index: number) => {
    const updatedPrices = servicePrices.filter((_, i) => i !== index);
    setServicePrices(updatedPrices);
    onFormChange("servicePrices", updatedPrices);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone_number) {
      alert("Name and phone number are required");
      return;
    }

    await onSubmit({
      name: formData.name,
      phone_number: formData.phone_number,
      address: formData.address,
      payment_due_date: formData.payment_due_date,
      servicePrices: servicePrices.map(({ service_id, custom_price }) => ({
        service_id,
        custom_price,
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={formData.name ?? ""}
                onChange={(e) => onFormChange("name", e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Phone Number <span className="text-destructive">*</span>
              </label>
              <Input
                type="tel"
                value={formData.phone_number ?? ""}
                onChange={(e) => onFormChange("phone_number", e.target.value)}
                placeholder="1234567890"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Address
              </label>
              <Input
                value={formData.address ?? ""}
                onChange={(e) => onFormChange("address", e.target.value)}
                placeholder="123 Main St"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Payment Due (days)
              </label>
              <Input
                type="number"
                min="1"
                value={formData.payment_due_date ?? ""}
                onChange={(e) =>
                  onFormChange(
                    "payment_due_date",
                    e.target.value ? Number.parseInt(e.target.value) : undefined
                  )
                }
                placeholder="30"
              />
            </div>
          </div>
        </div>
      </div>

      {services.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Custom Service Prices
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Add services and set custom pricing for this customer.
            </p>
          </div>

          {/* Add Service */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border border-border">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Service
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between bg-transparent"
                    type="button"
                  >
                    {selectedService ? selectedService.name : "Select Service"}
                    <ChevronDown className="h-4 w-4 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[250px]">
                  <div className="p-2 border-b border-border">
                    <Input
                      placeholder="Search services..."
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  {filteredServices.map((service) => (
                    <DropdownMenuItem
                      key={service.id}
                      onClick={() => {
                        setSelectedService(service);
                        setCustomPrice(service.price.toString());
                      }}
                      className="flex justify-between"
                    >
                      <span>{service.name}</span>
                      <span className="text-muted-foreground text-sm">
                        ₹{service.price}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Custom Price
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                onClick={addServicePrice}
                disabled={!selectedService || !customPrice}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </div>
          </div>

          {/* Added Services List */}
          {servicePrices.length > 0 ? (
            <div className="space-y-2">
              {servicePrices.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-background border border-border rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {item.service?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Custom:{" "}
                      <span className="font-semibold">
                        ₹{item.custom_price}
                      </span>
                      {item.service && (
                        <span className="text-xs ml-2">
                          (Default: ₹{item.service.price})
                        </span>
                      )}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeServicePrice(index)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic py-4 text-center">
              No custom prices added yet. Add a service to get started.
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Customer" : "Create Customer")}
        </Button>
      </div>
    </form>
  );
};

export default ClientForm;
