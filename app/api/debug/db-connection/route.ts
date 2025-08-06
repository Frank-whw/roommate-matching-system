import { NextResponse } from 'next/server';
import postgres from 'postgres';

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
      timestamp: new Date().toISOString(),
      connectionStringLength: dbUrl.length,
      isSupabase: dbUrl.includes('supabase.co'),
      hasPassword: urlParts ? urlParts[2].length > 0 : false,
      passwordLength: urlParts ? urlParts[2].length : 0,
    };

    // 测试连接
    let connectionTest: {
      success: boolean;
      error: string | null;
      details: any;
    } = {
      success: false,
      error: null,
      details: null
    };

    try {
      // 尝试直接连接测试
      const testClient = postgres(dbUrl, {
        max: 1,
        idle_timeout: 5,
        connect_timeout: 10,
        ssl: { rejectUnauthorized: false }
      });

      await testClient`SELECT 1 as test`;
      await testClient.end();
      
      connectionTest.success = true;
    } catch (testError: any) {
      connectionTest.error = testError.message;
      connectionTest.details = {
        code: testError.code,
        errno: testError.errno,
        syscall: testError.syscall,
        hostname: testError.hostname
      };
    }

    return NextResponse.json({
      status: 'connection_info',
      connectionInfo,
      connectionTest,
      suggestions: connectionTest.success ? [] : [
        'Check if Supabase project is paused or deleted',
        'Verify database password is correct',
        'Confirm project ID matches the URL',
        'Try resetting database password in Supabase dashboard',
        'Check if IP restrictions are enabled'
      ]
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}