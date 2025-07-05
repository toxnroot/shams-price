// /app/api/logout/route.js
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = await cookies();
cookieStore.delete('__session'); 
  return NextResponse.json({ status: 'logged_out' });
}
