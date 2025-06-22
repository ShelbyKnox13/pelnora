import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // Check admin authentication from headers
    const adminAuth = request.headers.get('x-admin-auth');
    const adminLastActivity = request.headers.get('x-admin-last-activity');

    if (!adminAuth || !adminLastActivity) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check for session timeout (10 minutes)
    const lastActivity = parseInt(adminLastActivity);
    const now = Date.now();
    if (now - lastActivity > 10 * 60 * 1000) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    const userId = parseInt(params.userId);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log('Received request body:', body); // Debug log

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { status, rejectionReason } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: approved, rejected, pending' },
        { status: 400 }
      );
    }

    // If status is rejected, require a rejection reason
    if (status === 'rejected' && !rejectionReason) {
      return NextResponse.json(
        { error: 'Rejection reason is required when rejecting KYC' },
        { status: 400 }
      );
    }

    // Update user's KYC status
    const [updatedUser] = await db
      .update(users)
      .set({
        kycStatus: status,
        kycRejectionReason: status === 'rejected' ? rejectionReason : null,
        kycReviewedAt: new Date(),
        kycReviewedBy: 1, // TODO: Get this from the session
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating KYC status:', error);
    return NextResponse.json(
      { error: 'Failed to update KYC status' },
      { status: 500 }
    );
  }
} 