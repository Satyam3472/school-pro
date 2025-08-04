import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get session from cookies
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    
    if (!session) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    // Verify session and get schoolId
    const payload = await verifySession(session);
    if (!payload || !payload.schoolId) {
      return NextResponse.json({ error: 'Invalid session or no schoolId' }, { status: 401 });
    }

    // Fetch school settings
    const response = await fetch(`http://localhost:3000/api/settings/${payload.schoolId}`);
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch school settings' }, { status: response.status });
    }

    const schoolData = await response.json();
    return NextResponse.json(schoolData);
    
  } catch (error) {
    console.error('Error fetching school data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 