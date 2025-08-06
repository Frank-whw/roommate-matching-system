import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 显示环境变量信息（隐藏敏感信息）
    const dbUrl = process.env.POSTGRES_URL || '';
    const urlParts = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    
    const connectionInfo = {
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      environment: process.env.NODE_ENV,
      host: urlParts ? urlParts[3] : 'unknown',
      port: urlParts ? urlParts[4] : 'unknown',
      database: urlParts ? urlParts[5] : 'unknown',
      user: urlParts ? urlParts[1] : 'unknown',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      status: 'connection_info',
      data: connectionInfo
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}