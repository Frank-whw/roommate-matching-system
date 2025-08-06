'use client';

import { useState } from 'react';
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
import { 
  Filter,
  X,
  RotateCcw,
  Search,
  Clock,
  Home,
  Brain,
  GraduationCap,
  MapPin
} from 'lucide-react';

interface FilterState {
  search: string;
  ageRange: [number, number];
  sleepTimeRange: string;
  studyHabit: string[];
  lifestyle: string[];
  cleanliness: string[];
  mbti: string[];
}

const initialFilters: FilterState = {
  search: '',
  ageRange: [18, 30],
  sleepTimeRange: '',
  studyHabit: [],
  lifestyle: [],
  cleanliness: [],
  mbti: []
};

export function FilterSidebar() {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);

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

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
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
            <Badge variant="secondary">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </CardTitle>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1"
          >
            {isExpanded ? '收起' : '展开'}全部
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            disabled={getActiveFiltersCount() === 0}
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
            <div className="text-sm text-gray-500 dark:text-gray-400">
              💡 匹配广场只显示与您相同性别的用户和队伍
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
                      { value: 'library', label: '常在图书馆' },
                      { value: 'dormitory', label: '常在寝室' },
                      { value: 'flexible', label: '灵活' }
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
                      { value: 'extremely_clean', label: '极爱干净' },
                      { value: 'regularly_tidy', label: '定期收拾' },
                      { value: 'acceptable', label: '过得去就行' }
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
        <Button className="w-full" size="sm">
          应用筛选 ({getActiveFiltersCount()})
        </Button>
      </CardContent>
    </Card>
  );
}