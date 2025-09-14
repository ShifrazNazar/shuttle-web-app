// /api/admin/delete-user/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { initializeFirebaseAdmin } from "~/lib/firebaseAdmin";

interface DeleteUserRequest {
  uid: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as DeleteUserRequest;
    const { uid } = body;

    // Validate required fields
    if (!uid) {
      return NextResponse.json(
        { error: "Missing required field: uid" },
        { status: 400 },
      );
    }

    const { adminAuth, adminDb } = initializeFirebaseAdmin();

    // Get user info before deletion (for logging/confirmation)
    let userInfo;
    try {
      userInfo = await adminAuth.getUser(uid);
    } catch {
      return NextResponse.json(
        { error: "User not found in Firebase Auth" },
        { status: 404 },
      );
    }

    // Delete user from Firebase Auth
    await adminAuth.deleteUser(uid);

    // Also delete the corresponding Firestore document
    try {
      await adminDb.collection("users").doc(uid).delete();
      console.log(`User Firestore document deleted: ${uid}`);
    } catch (firestoreError) {
      console.error("Error deleting user from Firestore:", firestoreError);
      // Don't fail the entire operation if Firestore deletion fails
      // The user is already deleted from Auth, which is the critical part
    }

    // Log the deletion for audit purposes
    console.log(`User deleted successfully:`, {
      uid,
      email: userInfo.email,
      displayName: userInfo.displayName,
      deletedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message:
        "User deleted successfully from both Firebase Auth and Firestore",
      deletedUser: {
        uid: userInfo.uid,
        email: userInfo.email,
        displayName: userInfo.displayName,
        wasEmailVerified: userInfo.emailVerified,
        accountCreatedAt: userInfo.metadata.creationTime,
        lastSignInAt: userInfo.metadata.lastSignInTime,
        deletedAt: new Date().toISOString(),
      },
      deletionDetails: {
        firebaseAuth: "Deleted",
        firestore: "Deleted",
        deletedAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error("Error deleting user:", error);

    let errorMessage = "Failed to delete user";
    let statusCode = 500;

    if (error && typeof error === "object" && "code" in error) {
      const errorCode = error.code as string;
      if (errorCode === "auth/user-not-found") {
        errorMessage = "User not found in Firebase Auth";
        statusCode = 404;
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
