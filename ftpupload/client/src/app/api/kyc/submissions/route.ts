import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { kycSubmissions, users } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: Request) {
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

    // Fetch KYC submissions with user details
    const submissions = await db
      .select({
        id: kycSubmissions.id,
        userId: kycSubmissions.userId,
        userName: users.name,
        userEmail: users.email,
        panNumber: kycSubmissions.panNumber,
        idProofType: kycSubmissions.idProofType,
        idProofNumber: kycSubmissions.idProofNumber,
        status: kycSubmissions.status,
        submittedAt: kycSubmissions.submittedAt,
        reviewedAt: kycSubmissions.reviewedAt,
        panCardImage: kycSubmissions.panCardImage,
        idProofImage: kycSubmissions.idProofImage,
      })
      .from(kycSubmissions)
      .leftJoin(users, eq(kycSubmissions.userId, users.id))
      .orderBy(desc(kycSubmissions.submittedAt));

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching KYC submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KYC submissions' },
      { status: 500 }
    );
  }
} 