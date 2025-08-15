import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { store } = body;

    if (!store || typeof store !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Store name is required and must be a string' 
        },
        { status: 400 }
      );
    }

    // Execute the store sync script
    const { stdout, stderr } = await execAsync(`node scripts/sync-store.js "${store}"`);
    
    if (stderr) {
      console.error('Store sync stderr:', stderr);
    }

    console.log('Store sync output:', stdout);

    return NextResponse.json({
      success: true,
      message: `Store synchronization initiated for: ${store}`,
      output: stdout,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in store sync webhook:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to execute store synchronization',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}