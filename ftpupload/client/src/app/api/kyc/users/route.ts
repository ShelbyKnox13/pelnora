import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { desc } from 'drizzle-orm';

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

    // Fetch users
    const userList = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));

    return NextResponse.json({ users: userList });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 