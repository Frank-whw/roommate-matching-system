'use client';

import { useEffect } from 'react';

export default function ErrorFilter() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // 过滤网络请求错误
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        try {
          return await originalFetch(...args);
        } catch (error) {
          // 如果是已知的第三方错误，静默处理
          if (args[0] && typeof args[0] === 'string' && 
              (args[0].includes('zybTracker') || args[0].includes('hybridaction'))) {
            console.debug('Filtered third-party request error:', args[0]);
            return new Response(null, { status: 404 });
          }
          throw error;
        }
      };

      // 过滤控制台错误
      const originalError = console.error;
      console.error = (...args) => {
        const message = args.join(' ');
        
        if (
          message.includes('zybTracker') ||
          message.includes('hybridaction') ||
          message.includes('main.7ee886d8.js') ||
          message.includes('v[w] is not a function')
        ) {
          console.debug('Filtered third-party error:', message);
          return;
        }
        
        originalError.apply(console, args);
      };
    }
  }, []);

  return null;
}