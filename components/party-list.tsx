"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Party, PartyListProps } from "@/lib/types";

export function PartyList({ parties }: PartyListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parties.map((party) => (
            <TableRow key={party.id}>
              <TableCell className="font-medium">{party.name}</TableCell>
              <TableCell className="text-sm text-gray-600">
                {new Date(party.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
