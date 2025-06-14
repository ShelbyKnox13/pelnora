import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { kycSubmissions, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get authentication headers
    const kycAuth = request.headers.get('x-kyc-auth');
    const kycLastActivity = request.headers.get('x-kyc-last-activity');

    // Check authentication
    if (!kycAuth || !kycLastActivity) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check session timeout (10 minutes)
    const lastActivityTime = parseInt(kycLastActivity);
    if (Date.now() - lastActivityTime > 10 * 60 * 1000) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    // Get the KYC submission
    const submission = await db
      .select()
      .from(kycSubmissions)
      .where(eq(kycSubmissions.id, params.id))
      .limit(1);

    if (!submission.length) {
      return NextResponse.json(
        { error: 'KYC submission not found' },
        { status: 404 }
      );
    }

    // Check if submission is already rejected
    if (submission[0].status === 'rejected') {
      return NextResponse.json(
        { error: 'KYC submission is already rejected' },
        { status: 400 }
      );
    }

    // Update KYC submission status
    await db
      .update(kycSubmissions)
      .set({
        status: 'rejected',
        reviewedAt: new Date(),
      })
      .where(eq(kycSubmissions.id, params.id));

    // Update user's KYC status
    await db
      .update(users)
      .set({
        kycStatus: 'rejected',
        updatedAt: new Date(),
      })
      .where(eq(users.id, submission[0].userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error rejecting KYC submission:', error);
    return NextResponse.json(
      { error: 'Failed to reject KYC submission' },
      { status: 500 }
    );
  }
} 