import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';

// GET /api/categories - Fetch all categories
export async function GET(request: NextRequest) {
  try {
    const categories = await db.getCategories();

    return NextResponse.json({
      success: true,
      categories,
      total: categories.length,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, icon, color } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    const category = await db.createCategory({
      name,
      slug,
      description,
      icon,
      color: color || '#3b82f6',
    });

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
