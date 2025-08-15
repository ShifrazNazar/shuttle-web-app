// /api/admin/reset-password/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { initializeFirebaseAdmin } from "~/lib/firebaseAdmin";

interface ResetPasswordRequest {
  uid: string;
  newPassword: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ResetPasswordRequest;
    const { uid, newPassword } = body;

    // Validate required fields
    if (!uid) {
      return NextResponse.json(
        { error: "Missing required field: uid" },
        { status: 400 },
      );
    }

    if (!newPassword) {
      return NextResponse.json(
        { error: "Missing required field: newPassword" },
        { status: 400 },
      );
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 },
      );
    }

    const { adminAuth } = initializeFirebaseAdmin();

    // Get user info before password reset (for logging/confirmation)
    let userInfo;
    try {
      userInfo = await adminAuth.getUser(uid);
    } catch {
      return NextResponse.json(
        { error: "User not found in Firebase Auth" },
        { status: 404 },
      );
    }

    // Update user password in Firebase Auth
    await adminAuth.updateUser(uid, {
      password: newPassword,
    });

    // Log the password reset for audit purposes (don't log the actual password)
    console.log(`Password reset successfully:`, {
      uid,
      email: userInfo.email,
      displayName: userInfo.displayName,
      resetAt: new Date().toISOString(),
      passwordLength: newPassword.length,
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
      user: {
        uid: userInfo.uid,
        email: userInfo.email,
        displayName: userInfo.displayName,
        emailVerified: userInfo.emailVerified,
        resetAt: new Date().toISOString(),
      },
      security: {
        passwordLength: newPassword.length,
        requiresReauth: true, // User will need to sign in again with new password
        oldPasswordInvalidated: true,
      },
    });
  } catch (error: unknown) {
    console.error("Error resetting password:", error);

    let errorMessage = "Failed to reset password";
    let statusCode = 500;

    if (error && typeof error === "object" && "code" in error) {
      const errorCode = error.code as string;
      if (errorCode === "auth/user-not-found") {
        errorMessage = "User not found in Firebase Auth";
        statusCode = 404;
      } else if (errorCode === "auth/invalid-uid") {
        errorMessage = "Invalid user ID format";
        statusCode = 400;
      } else if (errorCode === "auth/weak-password") {
        errorMessage = "Password is too weak";
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
