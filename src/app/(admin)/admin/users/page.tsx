"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "~/lib/firebaseClient";
import { Button } from "~/components/ui/button";
import { Plus, Edit, Trash2, Car, Search, Mail } from "lucide-react";

interface Driver {
  id: string;
  email: string;
  name: string;
  role: "driver";
  licenseNumber?: string;
  vehicleInfo?: string;
  busId: string;
  createdAt: Date;
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    licenseNumber: "",
    vehicleInfo: "",
    busId: "",
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const driversRef = collection(db, "users");
      const q = query(driversRef, where("role", "==", "driver"));
      const snapshot = await getDocs(q);
      const driversData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Driver[];
      console.log("driversData", driversData);
      setDrivers(driversData);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const driverData = {
        ...formData,
        role: "driver" as const,
        createdAt: new Date(),
        // Default password will be set manually - mentioned in UI
        defaultPassword: "Driver123!", // This is just for reference
      };

      if (editingDriver) {
        // Update existing driver
        const driverRef = doc(db, "users", editingDriver.id);
        await updateDoc(driverRef, driverData);
      } else {
        // Add new driver
        await addDoc(collection(db, "users"), driverData);
      }

      setShowAddModal(false);
      setEditingDriver(null);
      resetForm();
      fetchDrivers();

      // Show success message with email instruction
      alert(`Driver ${editingDriver ? "updated" : "created"} successfully! 
      
Please send login credentials to: ${formData.email}
Default Password: Driver123!
(Driver can change password after first login)`);
    } catch (error) {
      console.error("Error saving driver:", error);
      alert("Error saving driver. Please try again.");
    }
  };

  const handleDelete = async (driverId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this driver? This action cannot be undone.",
      )
    ) {
      try {
        await deleteDoc(doc(db, "users", driverId));
        fetchDrivers();
      } catch (error) {
        console.error("Error deleting driver:", error);
        alert("Error deleting driver. Please try again.");
      }
    }
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      email: driver.email,
      name: driver.name,
      licenseNumber: driver.licenseNumber || "",
      vehicleInfo: driver.vehicleInfo || "",
      busId: driver.busId || "",
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      email: "",
      name: "",
      licenseNumber: "",
      vehicleInfo: "",
      busId: "",
    });
  };

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.busId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Driver Management</h1>
        <div className="flex items-center justify-center py-12">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Driver Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage bus drivers and their assignments. Students register through
            the mobile app.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Driver
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search drivers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-md border py-2 pr-3 pl-10 focus:border-transparent focus:ring-2 focus:outline-none"
        />
      </div>

      {/* Drivers Table */}
      <div className="bg-card rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Driver
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Bus Assignment
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  License & Vehicle
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-muted/50 border-b">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <Car className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{driver.name}</div>
                        <div className="text-muted-foreground flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {driver.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                      Bus {driver.busId || "Unassigned"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="space-y-1">
                      {driver.licenseNumber && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">License:</span>
                          <span>{driver.licenseNumber}</span>
                        </div>
                      )}
                      {driver.vehicleInfo && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Vehicle:</span>
                          <span>{driver.vehicleInfo}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-sm">
                    {driver.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(driver)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(driver.id)}
                        className="text-destructive hover:text-destructive"
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
        {filteredDrivers.length === 0 && (
          <div className="text-muted-foreground py-12 text-center">
            <Car className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>No drivers found</p>
            <p className="mt-1 text-xs">Add your first driver to get started</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background mx-4 w-full max-w-md rounded-lg p-6">
            <h2 className="mb-4 text-xl font-semibold">
              {editingDriver ? "Edit Driver" : "Add New Driver"}
            </h2>

            {!editingDriver && (
              <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> After creating the driver account,
                  manually send login credentials:
                  <br />• Email: [driver email]
                  <br />• Default Password: Driver123!
                  <br />• Driver can change password after first login
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                  placeholder="Driver's full name"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                  placeholder="driver@example.com"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Bus ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.busId}
                  onChange={(e) =>
                    setFormData({ ...formData, busId: e.target.value })
                  }
                  className="border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                  placeholder="e.g., B001, B002"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  License Number
                </label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, licenseNumber: e.target.value })
                  }
                  className="border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                  placeholder="Driver's license number"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Vehicle Information
                </label>
                <input
                  type="text"
                  value={formData.vehicleInfo}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleInfo: e.target.value })
                  }
                  className="border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                  placeholder="e.g., Toyota Coaster - Plate ABC123"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingDriver ? "Update Driver" : "Add Driver"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingDriver(null);
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
    </div>
  );
}
