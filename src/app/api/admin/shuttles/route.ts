import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/firebaseClient";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import type { ShuttleFleet, ShuttleFormData } from "~/types";

// GET /api/admin/shuttles - Get all shuttles
export async function GET() {
  try {
    // Get all shuttles
    const shuttlesRef = collection(db, "shuttles");
    const shuttlesQuery = query(shuttlesRef, orderBy("licensePlate", "asc"));
    const snapshot = await getDocs(shuttlesQuery);

    const shuttles: ShuttleFleet[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        licensePlate: data.licensePlate as string,
        capacity: data.capacity as number,
        driverId: data.driverId as string | undefined,
        status: data.status as "active" | "inactive" | "maintenance",
        model: data.model as string | undefined,
        year: data.year as number | undefined,
        color: data.color as string | undefined,
        createdAt: data.createdAt?.toDate() ?? new Date(),
        updatedAt: data.updatedAt?.toDate() ?? new Date(),
      };
    });

    return NextResponse.json({ shuttles });
  } catch (error) {
    console.error("Error fetching shuttles:", error);
    return NextResponse.json(
      { error: "Failed to fetch shuttles" },
      { status: 500 },
    );
  }
}

// POST /api/admin/shuttles - Create new shuttle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      licensePlate,
      capacity,
      model,
      year,
      color,
      status = "active",
    }: ShuttleFormData = body;

    // Validate required fields
    if (!licensePlate || !capacity || !model || !year) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if license plate already exists
    const existingShuttle = await getDocs(
      query(
        collection(db, "shuttles"),
        where("licensePlate", "==", licensePlate),
      ),
    );

    if (!existingShuttle.empty) {
      return NextResponse.json(
        { error: "Shuttle with this license plate already exists" },
        { status: 400 },
      );
    }

    // Create shuttle
    const now = new Date();
    const shuttleData = {
      licensePlate,
      capacity: Number(capacity),
      model,
      year: Number(year),
      color: color || "",
      status,
      createdAt: now,
      updatedAt: now,
    };

    const shuttleRef = await addDoc(collection(db, "shuttles"), shuttleData);

    return NextResponse.json({
      success: true,
      shuttleId: shuttleRef.id,
      message: "Shuttle created successfully",
    });
  } catch (error) {
    console.error("Error creating shuttle:", error);
    return NextResponse.json(
      { error: "Failed to create shuttle" },
      { status: 500 },
    );
  }
}

// PUT /api/admin/shuttles - Update shuttle
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Shuttle ID is required" },
        { status: 400 },
      );
    }

    // Check if shuttle exists
    const shuttleRef = doc(db, "shuttles", id as string);
    const shuttleDoc = await getDocs(
      query(collection(db, "shuttles"), where("__name__", "==", id)),
    );

    if (shuttleDoc.empty) {
      return NextResponse.json({ error: "Shuttle not found" }, { status: 404 });
    }

    // If license plate is being updated, check for duplicates
    if (updates.licensePlate) {
      const existingShuttle = await getDocs(
        query(
          collection(db, "shuttles"),
          where("licensePlate", "==", updates.licensePlate),
          where("__name__", "!=", id),
        ),
      );

      if (!existingShuttle.empty) {
        return NextResponse.json(
          { error: "Shuttle with this license plate already exists" },
          { status: 400 },
        );
      }
    }

    // Update shuttle
    await updateDoc(shuttleRef, {
      ...updates,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Shuttle updated successfully",
    });
  } catch (error) {
    console.error("Error updating shuttle:", error);
    return NextResponse.json(
      { error: "Failed to update shuttle" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/shuttles - Delete shuttle
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shuttleId = searchParams.get("id");

    if (!shuttleId) {
      return NextResponse.json(
        { error: "Shuttle ID is required" },
        { status: 400 },
      );
    }

    // Check if shuttle exists
    const shuttleRef = doc(db, "shuttles", shuttleId);
    const shuttleDoc = await getDocs(
      query(collection(db, "shuttles"), where("__name__", "==", shuttleId)),
    );

    if (shuttleDoc.empty) {
      return NextResponse.json({ error: "Shuttle not found" }, { status: 404 });
    }

    const shuttleData = shuttleDoc.docs[0]?.data();

    // Check if shuttle is assigned to a driver
    if (shuttleData?.driverId) {
      return NextResponse.json(
        { error: "Cannot delete shuttle that is assigned to a driver" },
        { status: 400 },
      );
    }

    // Delete shuttle
    await deleteDoc(shuttleRef);

    return NextResponse.json({
      success: true,
      message: "Shuttle deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting shuttle:", error);
    return NextResponse.json(
      { error: "Failed to delete shuttle" },
      { status: 500 },
    );
  }
}
