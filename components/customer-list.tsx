"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { Customer, CustomerListProps } from "@/lib/types";

export function CustomerList({
  customers,
  onSelectCustomer,
}: CustomerListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">{customer.name}</TableCell>
              <TableCell>{customer.phone_number}</TableCell>
              <TableCell className="text-sm text-gray-600">
                {new Date(customer.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {onSelectCustomer && (
                  <Button
                    onClick={() => onSelectCustomer(customer)}
                    variant="outline"
                    size="sm"
                  >
                    View Parties
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
