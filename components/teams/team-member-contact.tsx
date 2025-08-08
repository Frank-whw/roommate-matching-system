'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Copy, 
  Check, 
  Eye, 
  EyeOff,
  Mail,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast-notifications';

interface ContactInfo {
  wechatId: string | null;
}

interface TeamMemberContactProps {
  member: {
    user: {
      id: number;
      name: string | null;
      email: string;
    };
    profile: {
      avatarUrl?: string | null;
      bio?: string | null;
      major?: string | null;
    } | null;
    membership: {
      role: 'leader' | 'member';
      joinedAt: Date;
    };
    contactInfo?: ContactInfo;
  };
  isCurrentUser: boolean;
}

export function TeamMemberContact({ member, isCurrentUser }: TeamMemberContactProps) {
  const [showContact, setShowContact] = useState(false);
  const [copiedWechat, setCopiedWechat] = useState(false);
  const { showToast } = useToast();

  const copyToClipboard = async (text: string, type: 'wechat') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedWechat(true);
      setTimeout(() => setCopiedWechat(false), 2000);
      showToast({
        type: 'success',
        message: '微信号已复制到剪贴板'
      });
    } catch (err) {
      showToast({
        type: 'error',
        message: '复制失败'
      });
    }
  };

  const hasContactInfo = member.contactInfo?.wechatId;

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {member.user.name?.charAt(0) || member.user.email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium text-foreground truncate">
                {member.user.name || `用户${member.user.id}`}
              </h4>
              {member.membership.role === 'leader' && (
                <Badge variant="default" className="text-xs">
                  队长
                </Badge>
              )}
              {isCurrentUser && (
                <Badge variant="outline" className="text-xs">
                  我
                </Badge>
              )}
            </div>
            
            {member.profile?.major && (
              <p className="text-sm text-muted-foreground mb-1">
                {member.profile.major}
              </p>
            )}
            
            {member.profile?.bio && (
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {member.profile.bio}
              </p>
            )}

            {/* 联系方式控制 */}
            {!isCurrentUser && hasContactInfo && (
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowContact(!showContact)}
                  className="h-7 text-xs"
                >
                  {showContact ? (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      隐藏联系方式
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      查看联系方式
                    </>
                  )}
                </Button>

                {/* 联系方式详情 */}
                {showContact && (
                  <div className="space-y-2 p-2 bg-muted/50 rounded-md">
                    {member.contactInfo?.wechatId && (
                      <div className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2 min-w-0">
                          <Users className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">微信号</p>
                            <p className="text-sm font-mono text-foreground truncate">
                              {member.contactInfo.wechatId}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 flex-shrink-0"
                          onClick={() => copyToClipboard(member.contactInfo!.wechatId!, 'wechat')}
                        >
                          {copiedWechat ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">邮箱</p>
                        <p className="text-sm text-foreground truncate">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 当前用户的联系方式提示 */}
            {isCurrentUser && !hasContactInfo && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs text-yellow-800">
                  <Mail className="h-3 w-3 inline mr-1" />
                  完善微信号让队友更容易联系到您
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}