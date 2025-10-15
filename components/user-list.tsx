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
import { UserData, UserListProps } from "@/lib/types";
import { Loader2, Trash2 } from "lucide-react";

export function UserList({ users, onDeleteUser }: UserListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Contact Number</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell className="capitalize">
                {user.role || "user"}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {new Date(user.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {user.contactNumber || "N/A"}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {user.address || "N/A"}
              </TableCell>
              <TableCell>
                {user.role !== "admin" && onDeleteUser && (
                  <Button
                    onClick={() => onDeleteUser(user.id, user.name)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
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
