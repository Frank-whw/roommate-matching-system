'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Filter,
  X,
  RotateCcw,
  Search,
  Clock,
  Home,
  Brain,
  GraduationCap,
  MapPin,
  Loader2
} from 'lucide-react';

interface FilterState {
  search: string;
  gender: string;
  ageRange: [number, number];
  sleepTimeRange: string;
  studyHabit: string[];
  lifestyle: string[];
  cleanliness: string[];
  mbti: string[];
}

const initialFilters: FilterState = {
  search: '',
  gender: '',
  ageRange: [18, 30],
  sleepTimeRange: '',
  studyHabit: [],
  lifestyle: [],
  cleanliness: [],
  mbti: []
};

export function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // 从URL参数初始化筛选状态
  useEffect(() => {
    const urlFilters = {
      search: searchParams.get('search') || '',
      gender: searchParams.get('gender') || '',
      ageRange: [
        parseInt(searchParams.get('minAge') || '18'),
        parseInt(searchParams.get('maxAge') || '30')
      ] as [number, number],
      sleepTimeRange: searchParams.get('sleepTime') || '',
      studyHabit: searchParams.get('studyHabit')?.split(',').filter(Boolean) || [],
      lifestyle: searchParams.get('lifestyle')?.split(',').filter(Boolean) || [],
      cleanliness: searchParams.get('cleanliness')?.split(',').filter(Boolean) || [],
      mbti: searchParams.get('mbti')?.split(',').filter(Boolean) || []
    };
    setFilters(urlFilters);
  }, [searchParams]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleArrayFilterChange = (key: keyof FilterState, value: string, checked: boolean) => {
    setFilters(prev => {
      const currentArray = prev[key] as string[];
      return {
        ...prev,
        [key]: checked 
          ? [...currentArray, value]
          : currentArray.filter(item => item !== value)
      };
    });
  };

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    router.push('/explore', { scroll: false });
  }, [router]);

  const applyFilters = useCallback(async () => {
    setIsApplying(true);
    
    const params = new URLSearchParams();
    
    if (filters.search.trim()) params.set('search', filters.search.trim());
    if (filters.gender && filters.gender !== 'all') params.set('gender', filters.gender);
    if (filters.ageRange[0] !== 18) params.set('minAge', filters.ageRange[0].toString());
    if (filters.ageRange[1] !== 30) params.set('maxAge', filters.ageRange[1].toString());
    if (filters.sleepTimeRange) params.set('sleepTime', filters.sleepTimeRange);
    if (filters.studyHabit.length > 0) params.set('studyHabit', filters.studyHabit.join(','));
    if (filters.lifestyle.length > 0) params.set('lifestyle', filters.lifestyle.join(','));
    if (filters.cleanliness.length > 0) params.set('cleanliness', filters.cleanliness.join(','));
    if (filters.mbti.length > 0) params.set('mbti', filters.mbti.join(','));

    const queryString = params.toString();
    router.push(`/explore${queryString ? `?${queryString}` : ''}`, { scroll: false });
    
    setIsApplying(false);
  }, [filters, router]);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.gender && filters.gender !== 'all') count++;
    if (filters.sleepTimeRange) count++;
    count += filters.studyHabit.length;
    count += filters.lifestyle.length;
    count += filters.cleanliness.length;
    count += filters.mbti.length;
    return count;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            筛选条件
          </div>
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="animate-pulse bg-gradient-to-r from-pink-500 to-purple-500 text-white">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </CardTitle>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 transition-colors"
          >
            {isExpanded ? '收起' : '展开'}全部
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            disabled={getActiveFiltersCount() === 0}
            className="transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            重置
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 关键词搜索 */}
        <div>
          <Label className="flex items-center mb-2">
            <Search className="w-3 h-3 mr-1" />
            关键词搜索
          </Label>
          <Input
            placeholder="搜索专业、兴趣、简介..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        {/* 基本信息 */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center">
            <GraduationCap className="w-4 h-4 mr-2" />
            基本信息
          </h4>
          
          <div className="space-y-3">
            <div>
              <Label>性别</Label>
              <Select value={filters.gender} onValueChange={(value) => handleFilterChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择性别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">不限</SelectItem>
                  <SelectItem value="male">男</SelectItem>
                  <SelectItem value="female">女</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="flex items-center justify-between mb-2">
                <span>年龄范围</span>
                <span className="text-sm text-gray-500">
                  {filters.ageRange[0]} - {filters.ageRange[1]} 岁
                </span>
              </Label>
              <Slider
                value={filters.ageRange}
                onValueChange={(value) => handleFilterChange('ageRange', value as [number, number])}
                min={18}
                max={35}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <Label>睡眠时间</Label>
              <Select value={filters.sleepTimeRange} onValueChange={(value) => handleFilterChange('sleepTimeRange', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择睡眠时间范围" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">不限</SelectItem>
                  <SelectItem value="early">早睡早起 (22:00-06:00)</SelectItem>
                  <SelectItem value="normal">正常作息 (23:00-07:00)</SelectItem>
                  <SelectItem value="late">晚睡晚起 (00:00-08:00)</SelectItem>
                  <SelectItem value="night_owl">夜猫子 (01:00-09:00)</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>
        </div>

        {isExpanded && (
          <>
            {/* 作息习惯 */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                作息习惯
              </h4>
              
              <div className="space-y-3">
                <div>
                  <Label>学习习惯</Label>
                  <div className="space-y-2 mt-2">
                    {[
                      { value: 'early_bird', label: '早起学习' },
                      { value: 'night_owl', label: '夜猫子' },
                      { value: 'flexible', label: '灵活安排' }
                    ].map((item) => (
                      <div key={item.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`study-${item.value}`}
                          checked={filters.studyHabit.includes(item.value)}
                          onCheckedChange={(checked) => 
                            handleArrayFilterChange('studyHabit', item.value, checked as boolean)
                          }
                        />
                        <Label htmlFor={`study-${item.value}`} className="text-sm">
                          {item.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 生活习惯 */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center">
                <Home className="w-4 h-4 mr-2" />
                生活习惯
              </h4>
              
              <div className="space-y-3">
                <div>
                  <Label>生活方式</Label>
                  <div className="space-y-2 mt-2">
                    {[
                      { value: 'quiet', label: '安静型' },
                      { value: 'social', label: '社交型' },
                      { value: 'balanced', label: '平衡型' }
                    ].map((item) => (
                      <div key={item.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`lifestyle-${item.value}`}
                          checked={filters.lifestyle.includes(item.value)}
                          onCheckedChange={(checked) => 
                            handleArrayFilterChange('lifestyle', item.value, checked as boolean)
                          }
                        />
                        <Label htmlFor={`lifestyle-${item.value}`} className="text-sm">
                          {item.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>清洁习惯</Label>
                  <div className="space-y-2 mt-2">
                    {[
                      { value: 'very_clean', label: '非常整洁' },
                      { value: 'clean', label: '比较整洁' },
                      { value: 'moderate', label: '一般' }
                    ].map((item) => (
                      <div key={item.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cleanliness-${item.value}`}
                          checked={filters.cleanliness.includes(item.value)}
                          onCheckedChange={(checked) => 
                            handleArrayFilterChange('cleanliness', item.value, checked as boolean)
                          }
                        />
                        <Label htmlFor={`cleanliness-${item.value}`} className="text-sm">
                          {item.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* MBTI性格 */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center">
                <Brain className="w-4 h-4 mr-2" />
                性格类型
              </h4>
              
              <div>
                <Label>MBTI类型</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[
                    'INTJ', 'INTP', 'ENTJ', 'ENTP',
                    'INFJ', 'INFP', 'ENFJ', 'ENFP',
                    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
                    'ISTP', 'ISFP', 'ESTP', 'ESFP'
                  ].map((mbti) => (
                    <div key={mbti} className="flex items-center space-x-1">
                      <Checkbox
                        id={`mbti-${mbti}`}
                        checked={filters.mbti.includes(mbti)}
                        onCheckedChange={(checked) => 
                          handleArrayFilterChange('mbti', mbti, checked as boolean)
                        }
                      />
                      <Label htmlFor={`mbti-${mbti}`} className="text-xs">
                        {mbti}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* 应用筛选 */}
        <div className="space-y-2">
          <Button 
            className="w-full" 
            size="sm"
            onClick={applyFilters}
            disabled={isApplying}
          >
            {isApplying ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                应用中...
              </>
            ) : (
              `应用筛选 (${getActiveFiltersCount()})`
            )}
          </Button>
          
          {getActiveFiltersCount() > 0 && (
            <div className="text-xs text-center text-gray-500 dark:text-gray-400">
              已选择 {getActiveFiltersCount()} 个条件
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}