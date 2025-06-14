import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packages, users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface Session {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions) as Session;
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Reset package data
    await db.update(packages)
      .set({
        directReferrals: 0,
        unlockedLevels: 0,
        levelEarnings: "0",
        directEarnings: "0",
        binaryEarnings: "0",
        totalEarnings: "0"
      })
      .where(eq(packages.userId, userId));

    // Reset user data
    await db.update(users)
      .set({
        unlockedLevels: 0,
        leftTeamCount: 0,
        rightTeamCount: 0,
        totalEarnings: "0",
        withdrawableAmount: "0"
      })
      .where(eq(users.id, userId));

    return NextResponse.json({ message: 'Referrals reset successfully' });
  } catch (error) {
    console.error('Error resetting referrals:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 