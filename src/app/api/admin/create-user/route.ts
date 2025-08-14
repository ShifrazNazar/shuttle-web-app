// /api/admin/create-user/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { initializeFirebaseAdmin } from "~/lib/firebaseAdmin";

interface CreateUserRequest {
  email: string;
  username: string;
  role: "driver" | "student";
  assignedShuttleId?: string; // Optional for drivers
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateUserRequest;
    const { email, username, role, assignedShuttleId } = body;

    // Validate required fields
    if (!email || !username || !role) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: email, username, and role are required",
        },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Validate role
    if (!["driver", "student"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'driver' or 'student'" },
        { status: 400 },
      );
    }

    // Validate assignedShuttleId for drivers (can be empty initially)
    if (role === "driver" && assignedShuttleId === undefined) {
      return NextResponse.json(
        { error: "assignedShuttleId field is required for drivers" },
        { status: 400 },
      );
    }

    const { adminAuth, adminDb } = initializeFirebaseAdmin();

    // Check if user already exists
    try {
      const existingUser = await adminAuth.getUserByEmail(email);
      if (existingUser) {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 409 },
        );
      }
    } catch (error: unknown) {
      // If error is not "user not found", then something else went wrong
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "auth/user-not-found"
      ) {
        // User not found is expected, continue with creation
      } else {
        throw error;
      }
    }

    // Generate a secure default password
    const defaultPassword = role === "driver" ? "Driver123!" : "Student123!";

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password: defaultPassword,
      displayName: username,
      emailVerified: false,
    });

    // Prepare user data for Firestore
    const userData = {
      uid: userRecord.uid,
      email: userRecord.email,
      username: userRecord.displayName,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      defaultPassword,
      ...(role === "driver" && { assignedShuttleId }),
    };

    // Add user to Firestore
    const userRef = await adminDb.collection("users").add(userData);

    return NextResponse.json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully`,
      user: {
        id: userRef.id,
        uid: userRecord.uid,
        email: userRecord.email,
        username: userRecord.displayName,
        role,
        assignedShuttleId: role === "driver" ? assignedShuttleId : undefined,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        defaultPassword,
      },
    });
  } catch (error: unknown) {
    console.error("Error creating user:", error);

    let errorMessage = "Failed to create user";
    let statusCode = 500;

    if (error && typeof error === "object" && "code" in error) {
      const errorCode = error.code as string;
      if (errorCode === "auth/email-already-exists") {
        errorMessage = "A user with this email already exists";
        statusCode = 409;
      } else if (errorCode === "auth/invalid-email") {
        errorMessage = "Invalid email address";
        statusCode = 400;
      } else if (errorCode === "auth/weak-password") {
        errorMessage = "Password is too weak";
        statusCode = 400;
      } else if (errorCode === "auth/operation-not-allowed") {
        errorMessage = "User creation is not allowed";
        statusCode = 403;
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        code:
          error && typeof error === "object" && "code" in error
            ? error.code
            : undefined,
        details:
          error && typeof error === "object" && "message" in error
            ? error.message
            : undefined,
      },
      { status: statusCode },
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
