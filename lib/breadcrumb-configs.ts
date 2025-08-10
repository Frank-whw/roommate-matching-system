// 面包屑导航配置
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export const breadcrumbConfigs = {
  profile: [
    { label: '首页', href: '/' },
    { label: '个人资料' },
  ],
  explore: [
    { label: '首页', href: '/' },
    { label: '匹配广场' },
  ],
  teams: [
    { label: '首页', href: '/' },
    { label: '队伍广场' },
  ],
  createTeam: [
    { label: '首页', href: '/' },
    { label: '队伍广场', href: '/teams' },
    { label: '创建队伍' },
  ],
  matches: [
    { label: '首页', href: '/' },
    { label: '队伍管理' },
  ],
};