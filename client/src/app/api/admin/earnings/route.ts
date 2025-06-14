import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { earnings, users, type Earning } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user is admin
    const adminUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!adminUser?.isAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Fetch all earnings with user details
    const allEarnings = await db.query.earnings.findMany({
      with: {
        user: {
          columns: {
            firstName: true,
            lastName: true,
            referralId: true,
          },
        },
      },
      orderBy: (earnings, { desc }) => [desc(earnings.createdAt)],
    });

    return NextResponse.json(allEarnings);
  } catch (error) {
    console.error('Error fetching earnings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user is admin
    const adminUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!adminUser?.isAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body = await request.json();
    const { userId, amount, type, description, relatedUserId } = body;

    if (!userId || !amount || !type || !description) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Create new earning
    const newEarning = await db.insert(earnings).values({
      userId,
      amount,
      earningType: type,
      description,
      relatedUserId: relatedUserId || null,
    }).returning();

    return NextResponse.json(newEarning[0]);
  } catch (error) {
    console.error('Error creating earning:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user is admin
    const adminUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!adminUser?.isAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const earningId = searchParams.get('id');

    if (!earningId) {
      return new NextResponse('Missing earning ID', { status: 400 });
    }

    // Delete earning
    await db.delete(earnings).where(eq(earnings.id, parseInt(earningId)));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting earning:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 