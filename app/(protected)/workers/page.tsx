"use client";

import { Plus } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { deleteUserAction } from "@/app/action/auth";
import { UserList } from "@/components/user-list";
import type { UserData } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorker } from "@/app/action/worker";
import { toast } from "sonner";

export default function WorkersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [addWorkerModalOpen, setAddWorkerModalOpen] = useState(false);
  const [addingWorker, setAddingWorker] = useState(false);
  const [workerForm, setWorkerForm] = useState({
    email: "",
    password: "",
    name: "",
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

      if (error) {
        console.error("Error fetching users:", error);
        return;
      }

      // Filter out admin users, only show workers
      const workers =
        usersData?.users?.filter((user) => user.role !== "admin") || [];
      setUsers(workers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleDeleteUser() {
    if (!userToDelete) return;

    try {
      const result = await deleteUserAction(userToDelete.id);

      if (!result.success) {
        console.error("Error deleting user:", result.error);
        alert(`Error deleting user: ${result.error}`);
        return;
      }

      await fetchUsers();
      setDeleteModalOpen(false);
      setUserToDelete(null);
      toast.success("Worker deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error deleting worker");
    }
  }

  function openDeleteModal(userId: string, userName: string) {
    setUserToDelete({ id: userId, name: userName });
    setDeleteModalOpen(true);
  }

  const handleWorkerFormChange = (field: string, value: string) => {
    setWorkerForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingWorker(true);

    try {
      await createWorker({
        name: workerForm.name,
        email: workerForm.email,
        password: workerForm.password,
      });

      // Reset form
      setWorkerForm({
        email: "",
        password: "",
        name: "",
      });

      // Close modal and refresh users list
      setAddWorkerModalOpen(false);
      fetchUsers();
      toast("Worker added successfully!");
    } catch (error) {
      console.error("Error adding worker:", error);
      toast("Error adding worker");
    } finally {
      setAddingWorker(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                Manage Workers
              </h1>
              <p className="text-slate-600 mt-2">
                View and manage all your worker accounts (non-admin users)
              </p>
            </div>
            <Button
              type="button"
              onClick={() => setAddWorkerModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm w-full sm:w-auto"
            >
              <Plus size={20} /> Add Worker
            </Button>
          </div>
        </div>

        <div>
          <div className="p-8">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
              </div>
            ) : (
              <UserList users={users} onDeleteUser={openDeleteModal} />
            )}
          </div>
        </div>
      </div>

      {/* Delete Worker Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Delete Worker
            </DialogTitle>
            <DialogDescription className="text-slate-600 mt-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-900">
                "{userToDelete?.name}"
              </span>
              ? This action cannot be undone and will remove the worker account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setUserToDelete(null);
              }}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Worker Modal */}
      <Dialog open={addWorkerModalOpen} onOpenChange={setAddWorkerModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Add New Worker
            </DialogTitle>
            <DialogDescription className="text-slate-600 mt-2">
              Create a new worker account with user role access.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddWorker} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={workerForm.name}
                  onChange={(e) =>
                    handleWorkerFormChange("name", e.target.value)
                  }
                  placeholder="Enter worker's full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={workerForm.email}
                  onChange={(e) =>
                    handleWorkerFormChange("email", e.target.value)
                  }
                  placeholder="worker@example.com"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={workerForm.password}
                onChange={(e) =>
                  handleWorkerFormChange("password", e.target.value)
                }
                placeholder="Enter password"
                required
                minLength={6}
              />
            </div>
            <DialogFooter className="gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setAddWorkerModalOpen(false);
                  setWorkerForm({
                    email: "",
                    password: "",
                    name: "",
                  });
                }}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
                disabled={addingWorker}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white"
                disabled={addingWorker}
              >
                {addingWorker ? "Adding..." : "Add Worker"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
