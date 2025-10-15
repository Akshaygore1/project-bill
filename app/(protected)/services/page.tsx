"use client";

import { ServiceList } from "@/components/service-list";
import { Button } from "@/components/ui/button";
import { createService, getServices } from "@/app/action/service";
import { useState, useEffect } from "react";
import ServiceModal from "@/components/service-modal";
import { Service } from "@/lib/types";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isCreatingService, setIsCreatingService] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      const data = await getServices();
      setServices(data);
    } catch (error) {
      console.error("Error loading services:", error);
    }
  }

  async function handleCreateService(data: { name: string; price: number }) {
    setIsCreatingService(true);
    try {
      await createService(data);
      await loadServices();
      setIsServiceModalOpen(false);
    } catch (error) {
      console.error("Error creating service:", error);
    } finally {
      setIsCreatingService(false);
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Services Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Services</h1>
            <p className="text-sm text-gray-600">{services.length} services</p>
          </div>
          <Button onClick={() => setIsServiceModalOpen(true)}>
            Add Service
          </Button>
        </div>
        <ServiceList services={services} />
      </div>

      {/* Service Modal */}
      <ServiceModal
        isOpen={isServiceModalOpen}
        onOpenChange={setIsServiceModalOpen}
        onSubmit={handleCreateService}
        isLoading={isCreatingService}
      />
    </div>
  );
}
