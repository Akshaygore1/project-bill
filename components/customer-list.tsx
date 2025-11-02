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
import { Edit, Eye, Trash } from "lucide-react";

export function CustomerList({
  customers,
  onSelectCustomer,
}: CustomerListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Name</TableHead>
            <TableHead className="text-center">Phone Number</TableHead>
            <TableHead className="text-center">Created At</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="text-center">{customer.name}</TableCell>
              <TableCell className="text-center">{customer.phone_number}</TableCell>
              <TableCell className="text-center text-sm text-gray-600">
                {new Date(customer.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    onClick={() => onSelectCustomer(customer)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye />
                  </Button>
                  <Button
                    onClick={() => onSelectCustomer(customer)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit />
                  </Button>
                  <Button
                    onClick={() => onSelectCustomer(customer)}
                    variant="outline"
                    size="sm"
                  >
                    <Trash />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
