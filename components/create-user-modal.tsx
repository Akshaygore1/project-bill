"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateUserModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    email?: string;
    password?: string;
    name?: string;
    role?: "user" | "admin";
    contactNumber?: string;
    address?: string;
  };
  onFormChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export default function CreateUserModal({
  isOpen,
  onOpenChange,
  formData,
  onFormChange,
  onSubmit,
  isLoading,
}: CreateUserModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the system. Fill in all required fields.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email *
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email ?? ""}
                onChange={(e) => onFormChange("email", e.target.value)}
                required
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name *
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name ?? ""}
                onChange={(e) => onFormChange("name", e.target.value)}
                required
                placeholder="James Smith"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1"
              >
                Password *
              </label>
              <Input
                id="password"
                type="password"
                value={formData.password ?? ""}
                onChange={(e) => onFormChange("password", e.target.value)}
                required
                placeholder="some-secure-password"
              />
            </div>
            <div>
              <label
                htmlFor="contactNumber"
                className="block text-sm font-medium mb-1"
              >
                Contact Number
              </label>
              <Input
                id="contactNumber"
                type="text"
                value={formData.contactNumber ?? ""}
                onChange={(e) => onFormChange("contactNumber", e.target.value)}
                placeholder="1234567890"
              />
            </div>
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium mb-1"
              >
                Address
              </label>
              <Input
                id="address"
                type="text"
                value={formData.address ?? ""}
                onChange={(e) => onFormChange("address", e.target.value)}
                placeholder="123 Main St"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
