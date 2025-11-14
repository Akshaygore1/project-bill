"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import type { PartyFormProps } from "@/lib/types";

export function PartyForm({ onSubmit, customerId }: PartyFormProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit({ name, customer_id: customerId });
      setName("");
    } catch (error) {
      console.error("Error creating party:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="party-name" className="text-sm font-medium text-foreground">
          Party Name <span className="text-destructive">*</span>
        </label>
        <Input
          id="party-name"
          type="text"
          placeholder="Enter party name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-2"
        />
      </div>
      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => setName("")}
          disabled={isLoading}
        >
          Clear
        </Button>
        <Button type="submit" disabled={isLoading || !name.trim()}>
          {isLoading ? "Creating..." : "Add Party"}
        </Button>
      </div>
    </form>
  );
}
