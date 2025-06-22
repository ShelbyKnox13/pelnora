import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { kycSubmissions } from '@/lib/schema';
import { sql } from 'drizzle-orm';

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

    // Fetch KYC statistics
    const stats = await db
      .select({
        total: sql<number>`count(*)`,
        pending: sql<number>`count(*) filter (where ${kycSubmissions.status} = 'pending')`,
        approved: sql<number>`count(*) filter (where ${kycSubmissions.status} = 'approved')`,
        rejected: sql<number>`count(*) filter (where ${kycSubmissions.status} = 'rejected')`,
      })
      .from(kycSubmissions);

    return NextResponse.json({ stats: stats[0] });
  } catch (error) {
    console.error('Error fetching KYC stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KYC statistics' },
      { status: 500 }
    );
  }
} 