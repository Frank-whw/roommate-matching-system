'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Users, Crown } from 'lucide-react';
import { Team } from '@/lib/db/schema';

interface TeamSearchProps {
  teams: Team[];
  onSearchResults: (results: Team[]) => void;
}

export function TeamSearch({ teams, onSearchResults }: TeamSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    gender: '',
    status: '',
    maxMembers: ''
  });

  // 搜索和筛选逻辑
  useEffect(() => {
    let results = teams;

    // 文本搜索
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      results = results.filter(team => 
        team.name.toLowerCase().includes(term) ||
        (team.description && team.description.toLowerCase().includes(term)) ||
        (team.requirements && team.requirements.toLowerCase().includes(term))
      );
    }

    // 性别筛选
    if (filters.gender) {
      results = results.filter(team => team.gender === filters.gender);
    }

    // 状态筛选
    if (filters.status) {
      results = results.filter(team => team.status === filters.status);
    }

    // 成员数筛选
    if (filters.maxMembers) {
      const max = parseInt(filters.maxMembers);
      results = results.filter(team => team.maxMembers === max);
    }

    onSearchResults(results);
  }, [searchTerm, filters, teams, onSearchResults]);

  const clearFilters = () => {
    setFilters({
      gender: '',
      status: '',
      maxMembers: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <Card className="border border-gray-200/80 dark:border-gray-700/60 bg-white/90 dark:bg-gray-900/70 backdrop-blur-2xl shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg font-semibold">
          <Search className="w-5 h-5 mr-2 text-blue-600" />
          搜索队伍
        </CardTitle>
        <CardDescription className="text-gray-700 dark:text-gray-200">
          使用搜索和筛选功能找到合适的队伍
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* 搜索输入框 */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                placeholder="搜索队伍名称、要求或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200/80 dark:border-gray-700/70 focus:border-blue-500 focus:ring-blue-500 bg-white/90 dark:bg-gray-800/70 backdrop-blur-md"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="清除搜索"
                  title="清除搜索"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`border-gray-200/80 dark:border-gray-700/70 text-gray-600 dark:text-gray-300 bg-white/90 dark:bg-gray-800/70 backdrop-blur-md ${
                hasActiveFilters ? 'border-blue-500 text-blue-600' : ''
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              筛选
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {Object.values(filters).filter(v => v !== '').length}
                </Badge>
              )}
            </Button>
          </div>

          {/* 筛选选项 */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {/* 性别筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  性别
                </label>
                <select
                  value={filters.gender}
                  onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  aria-label="选择性别"
                  title="选择性别"
                >
                  <option value="">全部</option>
                  <option value="male">男生</option>
                  <option value="female">女生</option>
                </select>
              </div>

              {/* 状态筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  状态
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  aria-label="选择状态"
                  title="选择状态"
                >
                  <option value="">全部</option>
                  <option value="recruiting">招募中</option>
                  <option value="full">已满员</option>
                </select>
              </div>

              {/* 成员数筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  队伍规模
                </label>
                <select
                  value={filters.maxMembers}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxMembers: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  aria-label="选择队伍规模"
                  title="选择队伍规模"
                >
                  <option value="">全部</option>
                  <option value="4">4人队伍</option>
                </select>
              </div>

              {/* 清除筛选按钮 */}
              {hasActiveFilters && (
                <div className="md:col-span-3 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="text-gray-600 border-gray-300 hover:bg-gray-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    清除所有筛选
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* 搜索结果统计 */}
          {searchTerm || hasActiveFilters ? (
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
              找到 {teams.length} 个队伍
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
