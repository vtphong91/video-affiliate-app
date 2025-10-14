import { NextRequest, NextResponse } from 'next/server';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

// Endpoint to check file structure on Vercel
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking file structure on Vercel...');

    const apiPath = join(process.cwd(), 'app', 'api');
    
    // Check if app/api directory exists
    let apiDirExists = false;
    let apiContents = [];
    
    try {
      const stats = statSync(apiPath);
      apiDirExists = stats.isDirectory();
      
      if (apiDirExists) {
        apiContents = readdirSync(apiPath, { withFileTypes: true }).map(dirent => ({
          name: dirent.name,
          type: dirent.isDirectory() ? 'directory' : 'file',
          path: join('app', 'api', dirent.name)
        }));
      }
    } catch (error) {
      console.error('Error reading app/api:', error);
    }

    // Check specifically for test-db
    let testDbExists = false;
    let testDbContents = [];
    
    try {
      const testDbPath = join(apiPath, 'test-db');
      const stats = statSync(testDbPath);
      testDbExists = stats.isDirectory();
      
      if (testDbExists) {
        testDbContents = readdirSync(testDbPath, { withFileTypes: true }).map(dirent => ({
          name: dirent.name,
          type: dirent.isDirectory() ? 'directory' : 'file',
          path: join('app', 'api', 'test-db', dirent.name)
        }));
      }
    } catch (error) {
      console.error('Error reading test-db:', error);
    }

    const result = {
      success: true,
      message: 'File structure check completed',
      data: {
        currentWorkingDirectory: process.cwd(),
        apiDirectory: {
          path: apiPath,
          exists: apiDirExists,
          contents: apiContents
        },
        testDbDirectory: {
          path: join(apiPath, 'test-db'),
          exists: testDbExists,
          contents: testDbContents
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV,
          vercelRegion: process.env.VERCEL_REGION
        }
      }
    };

    console.log('✅ File structure check completed:', {
      apiExists: apiDirExists,
      testDbExists: testDbExists,
      apiContentsCount: apiContents.length,
      testDbContentsCount: testDbContents.length
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ File structure check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'File structure check failed',
        message: 'Failed to check file structure'
      },
      { status: 500 }
    );
  }
}
