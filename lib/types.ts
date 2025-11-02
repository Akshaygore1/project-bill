import { authClient } from "@/lib/auth-client";

// Database entity interfaces
export interface Customer {
  id: string;
  name: string;
  phone_number: string;
  address?: string | null;
  payment_due_date?: number | null;
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

export interface CustomerServicePrice {
  id: string;
  customer_id: string;
  service_id: string;
  custom_price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  customer_id: string;
  service_id: string;
  quantity: number;
  created_by: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderWithDetails {
  id: string;
  customer_id: string;
  service_id: string;
  quantity: number;
  created_by: string;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    name: string;
  };
  service: {
    name: string;
    price: string;
  };
  createdByUser: {
    name: string;
  };
}

export interface CustomerOrderGroup {
  customerName: string;
  customerId: string;
  totalAmount: number;
  orderCount: number;
  orders: OrderWithDetails[];
}

export interface CreatorOrderGroup {
  creatorName: string;
  creatorId: string;
  totalAmount: number;
  orderCount: number;
  orders: OrderWithDetails[];
}

export interface CreatorCustomerOrderGroup {
  creatorName: string;
  creatorId: string;
  customerName: string;
  customerId: string;
  totalAmount: number;
  orderCount: number;
  orders: OrderWithDetails[];
}

export interface CreatorOrderGroup {
  creatorName: string;
  creatorId: string;
  totalAmount: number;
  orderCount: number;
  orders: OrderWithDetails[];
}

// User management types
export type UserData = NonNullable<
  ReturnType<typeof authClient.admin.listUsers>["data"]
>["users"][0];

// Component prop interfaces
export interface CustomerFormProps {
  onSubmit: (data: { 
    name: string; 
    phone_number: string;
    address?: string;
    payment_due_date?: number;
    servicePrices?: { service_id: string; custom_price: number }[];
  }) => Promise<void>;
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
  onSelectCustomer: (customer: Customer) => void;
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

export interface OrderFormProps {
  customers: Customer[];
  services: Service[];
  onSubmit: (data: {
    customer_id: string;
    orderItems: { service_id: string; quantity: number }[];
  }) => Promise<void>;
}
