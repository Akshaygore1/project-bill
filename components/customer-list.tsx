"use client";

import { Table } from "./ui/table";
import { Customer, CustomerListProps } from "@/lib/types";

export function CustomerList({
  customers,
  onSelectCustomer,
}: CustomerListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone Number</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.name}</td>
              <td>{customer.phone_number}</td>
              <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
              <td>
                {onSelectCustomer && (
                  <button
                    onClick={() => onSelectCustomer(customer)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View Parties
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
