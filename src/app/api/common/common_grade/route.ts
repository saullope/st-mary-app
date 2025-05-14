import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const grades = await prisma.lUDI_COMMON_GRADE.findMany();
    return NextResponse.json(grades, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching grades' }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}