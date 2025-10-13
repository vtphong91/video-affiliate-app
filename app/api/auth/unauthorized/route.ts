import { NextRequest, NextResponse } from 'next/server';

/**
 * API Unauthorized Response
 * Returns 401 Unauthorized for API routes
 */

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'Unauthorized',
      message: 'Bạn không có quyền truy cập vào API này',
    },
    { status: 401 }
  );
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'Unauthorized',
      message: 'Bạn không có quyền truy cập vào API này',
    },
    { status: 401 }
  );
}

export async function PUT(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'Unauthorized',
      message: 'Bạn không có quyền truy cập vào API này',
    },
    { status: 401 }
  );
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'Unauthorized',
      message: 'Bạn không có quyền truy cập vào API này',
    },
    { status: 401 }
  );
}













