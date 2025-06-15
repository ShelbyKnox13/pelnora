import { NextResponse } from "next/server";
// Update the import path if "@/lib/db" does not exist, for example:
import { db } from "../../../lib/db";
// Or use the correct relative path based on your project structure
import { verifyAdminAuth } from "@/lib/auth";

/**
 * PATCH /api/kyc/status/[id]
 * 
 * Update KYC status for a user (admin only)
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const adminUser = await verifyAdminAuth();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body = await request.json();
    const { status, rejectionReason } = body;

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // If status is rejected, require a rejection reason
    if (status === 'rejected' && !rejectionReason) {
      return NextResponse.json(
        { error: "Rejection reason is required" },
        { status: 400 }
      );
    }

    // Update user's KYC status
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        kycStatus: status,
        kycRejectionReason: status === 'rejected' ? rejectionReason : null,
      },
    });

    return NextResponse.json({
      message: `KYC status updated to ${status}`,
      userId,
    });
  } catch (error: any) {
    console.error("Error updating KYC status:", error);
    return NextResponse.json(
      { error: "Failed to update KYC status" },
      { status: 500 }
    );
  }
}