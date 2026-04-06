import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Sparkles,
  ClipboardCheck,
  History,
  TrendingUp,
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '首页' },
  { to: '/generator', icon: Sparkles, label: '内容生成' },
  { to: '/scorer', icon: ClipboardCheck, label: '内容评分' },
  { to: '/history', icon: History, label: '实验历史' },
  { to: '/trending', icon: TrendingUp, label: '爆款分析' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-900">autoresearch-xhs</h1>
        <p className="text-xs text-gray-500 mt-1">小红书自动化运营</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="px-4 py-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-2">当前状态</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-sm text-gray-700">API 已连接</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
