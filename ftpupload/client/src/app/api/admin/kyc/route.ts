import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { kycSubmissions, users } from '@shared/schema';
import { sql, eq, desc } from 'drizzle-orm';

export async function GET(request: Request) {
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

    // Fetch KYC submissions with user details
    const submissions = await db
      .select({
        id: kycSubmissions.id,
        userId: kycSubmissions.userId,
        userName: sql<string>`concat(${users.firstName}, ' ', ${users.lastName})`,
        userEmail: users.email,
        panNumber: kycSubmissions.panNumber,
        idProofType: kycSubmissions.idProofType,
        idProofNumber: kycSubmissions.idProofNumber,
        panCardImage: kycSubmissions.panCardImage,
        status: kycSubmissions.status,
        submittedAt: kycSubmissions.submittedAt,
        reviewedAt: kycSubmissions.reviewedAt,
        reviewedBy: kycSubmissions.reviewedBy,
      })
      .from(kycSubmissions)
      .leftJoin(users, eq(kycSubmissions.userId, users.id))
      .orderBy(desc(kycSubmissions.submittedAt));

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching KYC submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KYC submissions' },
      { status: 500 }
    );
  }
} 