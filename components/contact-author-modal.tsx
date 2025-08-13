'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';

interface ContactAuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactAuthorModal({ isOpen, onClose }: ContactAuthorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 模态框 */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* 标题 */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            联系作者
          </h2>
        </div>

        {/* 微信二维码 */}
        <div className="text-center">
          <div className="inline-block p-4 bg-gray-50 rounded-lg">
            {/* 这里放置微信二维码图片 */}
            <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <Image
                src="/wechat-qr.png"
                alt="微信二维码"
                width={192}
                height={192}
                className="rounded-lg"
              />
            </div>
          </div>
          
          {/* 提示文字 */}
          <p className="text-sm text-gray-600 mt-4">
            扫码添加微信，备注：年级+专业+姓名（eg：24数据王宏伟）
          </p>
        </div>

        {/* 底部说明 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            如有系统使用问题或建议，欢迎联系
          </p>
        </div>
      </div>
    </div>
  );
}