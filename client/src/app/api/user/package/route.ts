import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packages } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userPackage = await db.query.packages.findFirst({
      where: eq(packages.userId, session.user.id),
    });

    if (!userPackage) {
      return new NextResponse('Package not found', { status: 404 });
    }

    return NextResponse.json(userPackage);
  } catch (error) {
    console.error('Error fetching user package:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 