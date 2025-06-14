import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Get form data
    const panNumber = formData.get('panNumber');
    const idProofType = formData.get('idProofType');
    const idProofNumber = formData.get('idProofNumber');
    const panCardImage = formData.get('panCardImage') as File;
    const idProofImage = formData.get('idProofImage') as File;

    // Validate required fields
    if (!panNumber || !idProofType || !idProofNumber || !panCardImage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user ID from session
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Save PAN card image
    const panCardBytes = await panCardImage.arrayBuffer();
    const panCardBuffer = Buffer.from(panCardBytes);
    const panCardPath = join(process.cwd(), 'public', 'uploads', 'kyc', `${userId}_pan.${panCardImage.name.split('.').pop()}`);
    await writeFile(panCardPath, panCardBuffer);

    // Save ID proof image if provided
    let idProofPath = null;
    if (idProofImage) {
      const idProofBytes = await idProofImage.arrayBuffer();
      const idProofBuffer = Buffer.from(idProofBytes);
      idProofPath = join(process.cwd(), 'public', 'uploads', 'kyc', `${userId}_id.${idProofImage.name.split('.').pop()}`);
      await writeFile(idProofPath, idProofBuffer);
    }

    // Update user's KYC information
    const [updatedUser] = await db
      .update(users)
      .set({
        panNumber: panNumber.toString(),
        idProofType: idProofType.toString(),
        idProofNumber: idProofNumber.toString(),
        panCardImage: `/uploads/kyc/${userId}_pan.${panCardImage.name.split('.').pop()}`,
        idProofImage: idProofImage ? `/uploads/kyc/${userId}_id.${idProofImage.name.split('.').pop()}` : null,
        kycStatus: 'pending',
        kycSubmittedAt: new Date(),
      })
      .where(eq(users.id, parseInt(userId)))
      .returning();

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update user KYC information' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error submitting KYC:', error);
    return NextResponse.json(
      { error: 'Failed to submit KYC information' },
      { status: 500 }
    );
  }
} 