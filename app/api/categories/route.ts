import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';
import { z } from 'zod';
import { handleError, createErrorResponse, createSuccessResponse, logError } from '@/lib/utils/error-handler';

export async function GET(request: NextRequest) {
  try {
    // Fetch categories from database
    const categories = await db.getCategories();

    // Transform categories to trending topics format
    const topics = categories.map((category: any) => ({
      id: category.id, // Use actual UUID instead of slug
      slug: category.slug, // Keep slug for reference
      name: category.name,
      color: getCategoryColor(category.color)
    }));

    // Add default topics if no categories exist
    if (topics.length === 0) {
      const defaultTopics = [
        { id: 'technology', name: 'Technology', color: 'bg-blue-100 text-blue-600' },
        { id: 'travel', name: 'Travel', color: 'bg-green-100 text-green-600' },
        { id: 'sport', name: 'Sport', color: 'bg-orange-100 text-orange-600' },
        { id: 'business', name: 'Business', color: 'bg-purple-100 text-purple-600' },
        { id: 'management', name: 'Management', color: 'bg-indigo-100 text-indigo-600' },
        { id: 'trends', name: 'Trends', color: 'bg-red-100 text-red-600' },
        { id: 'startups', name: 'Startups', color: 'bg-yellow-100 text-yellow-600' },
        { id: 'news', name: 'News', color: 'bg-gray-100 text-gray-600' },
      ];
      return NextResponse.json(
        createSuccessResponse({ topics: defaultTopics })
      );
    }

    return NextResponse.json(
      createSuccessResponse({ topics })
    );

  } catch (error) {
    const appError = handleError(error);
    logError(appError, 'GET /api/categories');
    
    // Return default topics on error
    const defaultTopics = [
      { id: 'technology', name: 'Technology', color: 'bg-blue-100 text-blue-600' },
      { id: 'travel', name: 'Travel', color: 'bg-green-100 text-green-600' },
      { id: 'sport', name: 'Sport', color: 'bg-orange-100 text-orange-600' },
      { id: 'business', name: 'Business', color: 'bg-purple-100 text-purple-600' },
      { id: 'management', name: 'Management', color: 'bg-indigo-100 text-indigo-600' },
      { id: 'trends', name: 'Trends', color: 'bg-red-100 text-red-600' },
      { id: 'startups', name: 'Startups', color: 'bg-yellow-100 text-yellow-600' },
      { id: 'news', name: 'News', color: 'bg-gray-100 text-gray-600' },
    ];

    return NextResponse.json(
      createSuccessResponse({ topics: defaultTopics })
    );
  }
}

function getCategoryColor(colorHex?: string | null): string {
  // Return default if no color provided
  if (!colorHex) {
    return 'bg-gray-100 text-gray-600';
  }

  // Convert hex color to Tailwind classes
  const colorMap: { [key: string]: string } = {
    '#3b82f6': 'bg-blue-100 text-blue-600',
    '#10b981': 'bg-green-100 text-green-600',
    '#f59e0b': 'bg-orange-100 text-orange-600',
    '#8b5cf6': 'bg-purple-100 text-purple-600',
    '#6366f1': 'bg-indigo-100 text-indigo-600',
    '#ef4444': 'bg-red-100 text-red-600',
    '#eab308': 'bg-yellow-100 text-yellow-600',
    '#6b7280': 'bg-gray-100 text-gray-600',
  };

  return colorMap[colorHex] || 'bg-gray-100 text-gray-600';
}

// POST /api/categories - Create new category
const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional().default('#3b82f6'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createCategorySchema.parse(body);

    // Create category in database
    const category = await db.createCategory(validatedData);

    return NextResponse.json(
      createSuccessResponse({ category })
    );

  } catch (error) {
    const appError = handleError(error);
    logError(appError, 'POST /api/categories');
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Validation failed', error.errors),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('DATABASE_ERROR', 'Failed to create category', appError.details),
      { status: 500 }
    );
  }
}