import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { token } = await request.json();
    const response = NextResponse.json({ success: true });
    response.cookies.set('__session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 ساعة
      path: '/',
    });
    return response;
  } catch (error) {
    console.error('خطأ في /api/session:', error);
    return NextResponse.json({ error: 'فشل في إعداد الجلسة' }, { status: 500 });
  }
}