import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { kycSubmissions, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication from headers
    const adminAuth = request.headers.get('x-admin-auth');
    const adminLastActivity = request.headers.get('x-admin-last-activity');

    if (!adminAuth || !adminLastActivity) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check for session timeout (10 minutes)
    const lastActivity = parseInt(adminLastActivity);
    const now = Date.now();
    if (now - lastActivity > 10 * 60 * 1000) {
      return NextResponse.json(
        { message: 'Session expired' },
        { status: 401 }
      );
    }

    const submissionId = parseInt(params.id);
    const adminId = 1; // TODO: Get this from the session

    // Get the submission
    const [submission] = await db
      .select()
      .from(kycSubmissions)
      .where(eq(kycSubmissions.id, submissionId))
      .limit(1);

    if (!submission) {
      return NextResponse.json(
        { error: 'KYC submission not found' },
        { status: 404 }
      );
    }

    if (submission.status !== 'pending') {
      return NextResponse.json(
        { error: 'KYC submission is not pending' },
        { status: 400 }
      );
    }

    // Update KYC submission
    await db
      .update(kycSubmissions)
      .set({
        status: 'approved',
        reviewedAt: new Date(),
        reviewedBy: adminId,
      })
      .where(eq(kycSubmissions.id, submissionId));

    // Update user's KYC status
    const [updatedUser] = await db
      .update(users)
      .set({
        kycStatus: true,
        kycReviewedAt: new Date(),
        kycReviewedBy: adminId,
      })
      .where(eq(users.id, submission.userId))
      .returning();

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error approving KYC submission:', error);
    return NextResponse.json(
      { error: 'Failed to approve KYC submission' },
      { status: 500 }
    );
  }
} 