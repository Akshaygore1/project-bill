"use client";

import { Table } from "./ui/table";
import { Party, PartyListProps } from "@/lib/types";

export function PartyList({ parties }: PartyListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {parties.map((party) => (
            <tr key={party.id}>
              <td>{party.name}</td>
              <td>{new Date(party.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
