"use client";

import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { deleteUserAction } from "@/app/action/auth";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CreateUserModal from "./create-user-modal";
import { RotateCw, UserPlus, Loader2, Trash2 } from "lucide-react";
import { UserData } from "@/lib/types";

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingUser, setAddingUser] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [newUserForm, setNewUserForm] = useState({
    email: "",
    password: "",
    name: "",
    role: "user" as "user" | "admin",
    contactNumber: "",
    address: "",
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data: usersData, error } = await authClient.admin.listUsers({
        query: {
          limit: 100,
          sortBy: "name",
          sortDirection: "asc",
        },
      });
      console.log(usersData);
      if (error) {
        console.error("Error fetching users:", error);
        return;
      }

      setUsers(usersData.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleFormChange = (field: string, value: string) => {
    setNewUserForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingUser(true);

    try {
      const { error } = await authClient.admin.createUser({
        email: newUserForm.email,
        password: newUserForm.password,
        name: newUserForm.name,
        data: {
          contactNumber: newUserForm.contactNumber,
          address: newUserForm.address,
        },
      });
      console.log({
        email: newUserForm.email,
        password: newUserForm.password,
        name: newUserForm.name,
        data: {
          contactNumber: newUserForm.contactNumber,
          address: newUserForm.address,
        },
      });
      if (error) {
        console.error("Error creating user:", error);
        alert(`Error creating user: ${error.message}`);
        return;
      }

      // Reset form
      setNewUserForm({
        email: "",
        password: "",
        name: "",
        role: "user",
        contactNumber: "",
        address: "",
      });

      // Close modal and refresh users list
      setIsModalOpen(false);
      fetchUsers();
      alert("User created successfully!");
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Error creating user");
    } finally {
      setAddingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete user "${userName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingUserId(userId);
    try {
      const result = await deleteUserAction(userId);

      if (!result.success) {
        console.error("Error deleting user:", result.error);
        alert(`Error deleting user: ${result.error}`);
        return;
      }

      // Refresh users list
      fetchUsers();
      alert("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user");
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="text-sm text-gray-600">{users.length} users</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchUsers}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCw className="w-4 h-4" />
            )}
          </Button>
          <Button onClick={() => setIsModalOpen(true)} size="sm">
            <UserPlus className="w-4 h-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        formData={newUserForm}
        onFormChange={handleFormChange}
        onSubmit={handleAddUser}
        isLoading={addingUser}
      />

      {/* Users */}
      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          <p className="text-sm text-gray-600 mt-2">Loading...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No users found</p>
          <Button onClick={() => setIsModalOpen(true)} className="mt-2">
            Add User
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
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
                  {user.role !== "admin" && (
                    <Button
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      variant="outline"
                      size="sm"
                      disabled={deletingUserId === user.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deletingUserId === user.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
