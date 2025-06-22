import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, packages, emiPayments, type EMIPayment } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phone: users.phone,
        referralId: users.referralId,
        referredBy: users.referredBy,
        status: users.status,
        bankDetails: users.bankDetails,
      })
      .from(users);

    // Get package and EMI information for each user
    const usersWithDetails = await Promise.all(
      allUsers.map(async (user) => {
        const userPackage = await db
          .select()
          .from(packages)
          .where(eq(packages.userId, user.id))
          .limit(1);

        const userEmiPayments = await db
          .select()
          .from(emiPayments)
          .where(eq(emiPayments.userId, user.id));

        const emiStatus = userEmiPayments.length > 0
          ? userEmiPayments.some((payment: EMIPayment) => payment.status === 'late')
            ? 'late'
            : userEmiPayments.every((payment: EMIPayment) => payment.status === 'paid')
              ? 'paid'
              : 'pending'
          : 'pending';

        return {
          ...user,
          package: userPackage[0] || { name: 'No Package', amount: 0 },
          emiStatus,
        };
      })
    );

    return NextResponse.json(usersWithDetails);
  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 