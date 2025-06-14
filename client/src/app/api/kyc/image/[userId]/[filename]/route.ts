import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { userId: string; filename: string } }
) {
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

    const { userId, filename } = params;
    
    // Try different possible paths for the image
    const possiblePaths = [
      path.join(process.cwd(), 'server', 'public', 'uploads', filename),
      path.join(process.cwd(), 'public', 'uploads', filename),
      path.join(process.cwd(), 'uploads', filename)
    ];

    let imagePath = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        imagePath = p;
        break;
      }
    }

    if (!imagePath) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'image/jpeg'; // default
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.pdf') contentType = 'application/pdf';

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error serving KYC image:', error);
    return NextResponse.json(
      { error: 'Failed to serve image' },
      { status: 500 }
    );
  }
} 