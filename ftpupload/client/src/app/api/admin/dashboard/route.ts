import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, packages, emiPayments, earnings, withdrawals, autoPool } from '@shared/schema';
import { sql, eq } from 'drizzle-orm';

export async function GET() {
  try {
    // Get total users
    const totalUsersResult = await db.select({ count: sql<number>`count(*)` }).from(users);
    const totalUsers = totalUsersResult[0].count || 0;

    // Get total active users (users who have logged in within last 30 days)
    const activeUsersResult = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`last_login >= NOW() - INTERVAL '30 days'`);
    const totalActiveUsers = activeUsersResult[0].count || 0;

    // Get total direct referrals
    const directReferralsResult = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`referred_by IS NOT NULL`);
    const totalDirectReferrals = directReferralsResult[0].count || 0;

    // Get total income paid
    const totalIncomePaidResult = await db.select({ sum: sql<number>`sum(amount)` })
      .from(earnings)
      .where(sql`type IN ('direct', 'binary', 'level', 'pool', 'emi_bonus')`);
    const totalIncomePaid = totalIncomePaidResult[0].sum || 0;

    // Get total withdrawals processed
    const totalWithdrawalsResult = await db.select({ sum: sql<number>`sum(amount)` })
      .from(withdrawals)
      .where(eq(withdrawals.status, 'approved'));
    const totalWithdrawalsProcessed = totalWithdrawalsResult[0].sum || 0;

    // Get pool participants count
    const poolParticipantsResult = await db.select({ count: sql<number>`count(*)` })
      .from(autoPool);
    const poolParticipantsCount = poolParticipantsResult[0].count || 0;

    // Get monthly data for the last 6 months
    const monthlyData = await db.execute(sql`
      SELECT
        to_char(date_trunc('month', created_at), 'Mon YYYY') as month,
        SUM(CASE WHEN type IN ('direct', 'binary', 'level', 'pool', 'emi_bonus') THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'withdrawal' AND status = 'approved' THEN amount ELSE 0 END) as withdrawals
      FROM (
        SELECT amount, type, created_at, status FROM earnings
        UNION ALL
        SELECT amount, 'withdrawal' as type, created_at, status FROM withdrawals
      ) as financial_events
      WHERE created_at >= date_trunc('month', now() - interval '6 months')
      GROUP BY date_trunc('month', created_at)
      ORDER BY date_trunc('month', created_at);
    `);

    // Get package distribution
    const packageDistribution = await db.select({
      package: packages.monthlyAmount,
      count: sql<number>`count(*)`
    })
    .from(packages)
    .groupBy(packages.monthlyAmount)
    .orderBy(packages.monthlyAmount);

    // Get EMI status distribution
    const emiStatusCounts = await db.select({
      status: sql<string>`case when paid then 'Paid' else 'Unpaid' end`,
      count: sql<number>`count(*)`
    })
    .from(emiPayments)
    .groupBy(sql`case when paid then 'Paid' else 'Unpaid' end`);

    // Get recent activity (last 10 activities)
    const recentActivity = await db
      .select({
        id: users.id,
        type: sql<string>`'user_signup'`,
        description: sql<string>`concat(${users.firstName}, ' ', ${users.lastName}, ' signed up')`,
        timestamp: users.createdAt,
      })
      .from(users)
      .orderBy(users.createdAt)
      .limit(10);

    return NextResponse.json({
      totalUsers,
      totalActiveUsers,
      totalDirectReferrals,
      totalIncomePaid,
      totalWithdrawalsProcessed,
      poolParticipantsCount,
      monthlyData,
      packageDistribution,
      emiStatusCounts,
      recentActivity: recentActivity.map(activity => ({
        ...activity,
        timestamp: new Date(activity.timestamp).toLocaleString(),
      })),
    });
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 