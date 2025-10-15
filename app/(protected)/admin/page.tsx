"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { deleteUserAction } from "../../action/auth";
import { Button } from "@/components/ui/button";
import { UserList } from "@/components/user-list";
import CreateUserModal from "@/components/create-user-modal";
import { UserData } from "@/lib/types";
import { UserPlus } from "lucide-react";

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [newUserForm, setNewUserForm] = useState({
    email: "",
    password: "",
    name: "",
    role: "user" as "user" | "admin",
    contactNumber: "",
    address: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const { data: usersData, error } = await authClient.admin.listUsers({
        query: {
          limit: 100,
          sortBy: "name",
          sortDirection: "asc",
        },
      });
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
  }

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
    <div className="container mx-auto p-4 space-y-8">
      {/* User Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Users</h1>
            <p className="text-sm text-gray-600">{users.length} users</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <UserPlus className="w-4 h-4" />
            Add User
          </Button>
        </div>
        <UserList users={users} onDeleteUser={handleDeleteUser} />
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
    </div>
  );
}
