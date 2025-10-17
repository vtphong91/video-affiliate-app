import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';
import { z } from 'zod';

// GET /api/categories/[id] - Fetch single category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categories = await db.getCategories();
    const category = categories.find((cat: any) => cat.id === params.id);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Category not found' },
      { status: 404 }
    );
  }
}

// PATCH /api/categories/[id] - Update category
const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  slug: z.string().min(1, 'Slug is required').optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateCategorySchema.parse(body);

    // Update category in database
    const category = await db.updateCategory(params.id, validatedData);

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error('Error updating category:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.deleteCategory(params.id);

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
