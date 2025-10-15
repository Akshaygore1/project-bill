import { authClient } from "@/lib/auth-client";

// Database entity interfaces
export interface Customer {
  id: string;
  name: string;
  phone_number: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Party {
  id: string;
  name: string;
  customer_id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

// User management types
export type UserData = NonNullable<
  ReturnType<typeof authClient.admin.listUsers>["data"]
>["users"][0];

// Component prop interfaces
export interface CustomerFormProps {
  onSubmit: (data: { name: string; phone_number: string }) => Promise<void>;
}

export interface PartyFormProps {
  onSubmit: (data: { name: string; customer_id: string }) => Promise<void>;
  customerId: string;
}

export interface ServiceFormProps {
  onSubmit: (data: { name: string; price: number }) => Promise<void>;
}

export interface CustomerListProps {
  customers: Customer[];
  onSelectCustomer?: (customer: Customer) => void;
}

export interface PartyListProps {
  parties: Party[];
}

export interface ServiceListProps {
  services: Service[];
}

export interface CreateUserModalProps {
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

export interface UserListProps {
  users: UserData[];
  onDeleteUser?: (userId: string, userName: string) => void;
}
