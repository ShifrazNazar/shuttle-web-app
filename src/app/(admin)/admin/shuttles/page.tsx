"use client";

import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Car,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  useShuttles,
  useShuttleActions,
  useShuttleStats,
} from "~/hooks/use-shuttles";
import { showToast } from "~/lib/toast";
import type { ShuttleFleet, ShuttleFormData } from "~/types";

export default function ShuttlesPage() {
  const { shuttles, loading, error, refetch } = useShuttles();
  const { stats } = useShuttleStats();
  const {
    createShuttle,
    updateShuttle,
    deleteShuttle,
    loading: actionLoading,
  } = useShuttleActions();

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingShuttle, setEditingShuttle] = useState<ShuttleFleet | null>(
    null,
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );

  const [formData, setFormData] = useState<ShuttleFormData>({
    licensePlate: "",
    capacity: 30,
    model: "",
    year: new Date().getFullYear(),
    color: "",
    status: "active",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingShuttle) {
        await updateShuttle(editingShuttle.id, formData);
        showToast.success("Shuttle updated successfully");
      } else {
        await createShuttle(formData);
        showToast.success("Shuttle created successfully");
      }

      setShowAddModal(false);
      setShowEditModal(false);
      setEditingShuttle(null);
      resetForm();
      await refetch();
    } catch (error) {
      console.error("Error saving shuttle:", error);
      showToast.error("Failed to save shuttle");
    }
  };

  const handleEdit = (shuttle: ShuttleFleet) => {
    setEditingShuttle(shuttle);
    setFormData({
      licensePlate: shuttle.licensePlate,
      capacity: shuttle.capacity,
      model: shuttle.model || "",
      year: shuttle.year || new Date().getFullYear(),
      color: shuttle.color || "",
      status: shuttle.status,
    });
    setShowEditModal(true);
  };

  const handleDelete = async (shuttleId: string) => {
    try {
      await deleteShuttle(shuttleId);
      showToast.success("Shuttle deleted successfully");
      setShowDeleteConfirm(null);
      await refetch();
    } catch (error) {
      console.error("Error deleting shuttle:", error);
      showToast.error("Failed to delete shuttle");
    }
  };

  const resetForm = () => {
    setFormData({
      licensePlate: "",
      capacity: 30,
      model: "",
      year: new Date().getFullYear(),
      color: "",
      status: "active",
    });
  };

  const filteredShuttles = shuttles.filter((shuttle) => {
    const matchesSearch =
      shuttle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shuttle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shuttle.color?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "inactive":
        return <XCircle className="h-4 w-4 text-gray-400" />;
      case "maintenance":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Shuttle Management</h1>
        <div className="flex items-center justify-center py-12">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Shuttle Management</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600">Error loading shuttles</p>
            <p className="text-muted-foreground mt-1 text-sm">{error}</p>
            <Button onClick={refetch} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Car className="h-6 w-6 text-blue-600" />
            Shuttle Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your shuttle fleet, track assignments, and monitor status
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Shuttle
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Total Shuttles
              </p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Car className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Active
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.active}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Assigned
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.assigned}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Available
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.available}
              </p>
            </div>
            <Car className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search shuttles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-md border py-2 pr-3 pl-10 focus:border-transparent focus:ring-2 focus:outline-none"
        />
      </div>

      {/* Shuttles Table */}
      <div className="bg-card rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Shuttle
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Capacity
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Assignment
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredShuttles.map((shuttle) => (
                <tr key={shuttle.id} className="hover:bg-muted/50 border-b">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <Car className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {shuttle.licensePlate}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {shuttle.model} {shuttle.year && `(${shuttle.year})`}
                        </div>
                        {shuttle.color && (
                          <div className="text-muted-foreground text-xs">
                            Color: {shuttle.color}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(shuttle.status)}
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(shuttle.status)}`}
                      >
                        {shuttle.status.charAt(0).toUpperCase() +
                          shuttle.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium">
                      {shuttle.capacity} seats
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {shuttle.driverId ? (
                      <span className="text-sm text-blue-600">Assigned</span>
                    ) : (
                      <span className="text-sm text-gray-500">Available</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(shuttle)}
                        title="Edit shuttle"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(shuttle.id)}
                        className="text-destructive hover:text-destructive"
                        title="Delete shuttle"
                        disabled={!!shuttle.driverId}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredShuttles.length === 0 && (
          <div className="text-muted-foreground py-12 text-center">
            <Car className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>No shuttles found</p>
            <p className="mt-1 text-xs">
              {searchTerm
                ? "Try adjusting your search"
                : "Add your first shuttle to get started"}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg p-6">
            <h2 className="mb-4 text-xl font-semibold">
              {editingShuttle ? "Edit Shuttle" : "Add New Shuttle"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  License Plate *
                </label>
                <input
                  type="text"
                  required
                  value={formData.licensePlate}
                  onChange={(e) =>
                    setFormData({ ...formData, licensePlate: e.target.value })
                  }
                  className="border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                  placeholder="ABC1234"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Model *
                </label>
                <input
                  type="text"
                  required
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  className="border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                  placeholder="Toyota Hiace"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Year *
                  </label>
                  <input
                    type="number"
                    required
                    min="2000"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        year: parseInt(e.target.value),
                      })
                    }
                    className="border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacity: parseInt(e.target.value),
                      })
                    }
                    className="border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Color</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                  placeholder="White"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as
                        | "active"
                        | "inactive"
                        | "maintenance",
                    })
                  }
                  className="border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Saving..."
                    : editingShuttle
                      ? "Update Shuttle"
                      : "Create Shuttle"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setEditingShuttle(null);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background mx-4 w-full max-w-md rounded-lg p-6">
            <h2 className="mb-4 text-xl font-semibold">Delete Shuttle</h2>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this shuttle? This action cannot
              be undone.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1"
                variant="destructive"
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(null)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
