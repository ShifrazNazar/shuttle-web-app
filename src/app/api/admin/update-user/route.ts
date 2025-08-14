// /api/admin/update-user/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { initializeFirebaseAdmin } from "~/lib/firebaseAdmin";

interface UpdateUserRequest {
  uid: string;
  email?: string;
  displayName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as UpdateUserRequest;
    const { uid, email, displayName } = body;

    // Validate required fields
    if (!uid) {
      return NextResponse.json(
        { error: "Missing required field: uid" },
        { status: 400 },
      );
    }

    const { adminAuth } = initializeFirebaseAdmin();
    const updateData: Record<string, string> = {};

    // Only update fields that are provided
    if (email !== undefined) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 },
        );
      }
      updateData.email = email;
    }

    if (displayName !== undefined) {
      updateData.displayName = displayName;
    }

    // Check if user exists before updating
    try {
      await adminAuth.getUser(uid);
    } catch (error) {
      return NextResponse.json(
        { error: "User not found in Firebase Auth" },
        { status: 404 },
      );
    }

    // Update user in Firebase Auth
    const updatedUser = await adminAuth.updateUser(uid, updateData);

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: {
        uid: updatedUser.uid,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        emailVerified: updatedUser.emailVerified,
        lastSignInTime: updatedUser.metadata.lastSignInTime,
        creationTime: updatedUser.metadata.creationTime,
      },
      updatedFields: Object.keys(updateData),
    });
  } catch (error: unknown) {
    console.error("Error updating user:", error);

    let errorMessage = "Failed to update user";
    let statusCode = 500;

    if (error && typeof error === "object" && "code" in error) {
      const errorCode = error.code as string;
      if (errorCode === "auth/user-not-found") {
        errorMessage = "User not found in Firebase Auth";
        statusCode = 404;
      } else if (errorCode === "auth/email-already-exists") {
        errorMessage = "Another user with this email already exists";
        statusCode = 409;
      } else if (errorCode === "auth/invalid-email") {
        errorMessage = "Invalid email address";
        statusCode = 400;
      } else if (errorCode === "auth/invalid-uid") {
        errorMessage = "Invalid user ID format";
        statusCode = 400;
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
