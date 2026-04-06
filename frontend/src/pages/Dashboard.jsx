import { Link } from 'react-router-dom'
import {
  Sparkles,
  ClipboardCheck,
  History,
  TrendingUp,
  ArrowRight,
  FileText,
  ThumbsUp,
  MessageCircle,
} from 'lucide-react'

const quickActions = [
  {
    to: '/generator',
    icon: Sparkles,
    label: '生成内容',
    desc: 'AI 生成小红书内容',
    color: 'bg-blue-500',
  },
  {
    to: '/scorer',
    icon: ClipboardCheck,
    label: '内容评分',
    desc: '评估内容质量',
    color: 'bg-green-500',
  },
  {
    to: '/history',
    icon: History,
    label: '实验历史',
    desc: '查看历史记录',
    color: 'bg-purple-500',
  },
  {
    to: '/trending',
    icon: TrendingUp,
    label: '爆款分析',
    desc: '分析热门内容',
    color: 'bg-orange-500',
  },
]

const recentExperiments = [
  {
    id: 1,
    topic: '春季护肤routine',
    title: '7天养出好皮肤',
    score: 5.5,
    date: '2026-04-06',
  },
  {
    id: 2,
    topic: '显瘦穿搭技巧',
    title: '3招告别臃肿',
    score: 4.2,
    date: '2026-04-05',
  },
  {
    id: 3,
    topic: '平价好物推荐',
    title: '100元搞定全套',
    score: 4.8,
    date: '2026-04-04',
  },
]

const stats = [
  { label: '总实验数', value: '24', icon: FileText },
  { label: '平均评分', value: '4.6', icon: ThumbsUp },
  { label: '发布笔记', value: '12', icon: MessageCircle },
]

export default function Dashboard() {
  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">控制台</h2>
        <p className="text-gray-500 mt-1">欢迎使用小红书自动化运营系统</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Icon size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">快捷入口</h3>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map(({ to, icon: Icon, label, desc, color }) => (
            <Link
              key={to}
              to={to}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-4">
                <div className={`${color} p-3 rounded-xl text-white`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">{label}</h4>
                    <ArrowRight
                      size={18}
                      className="text-gray-400 group-hover:text-blue-600 transition-colors"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Experiments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">最近实验</h3>
          <Link to="/history" className="text-sm text-blue-600 hover:text-blue-700">
            查看全部
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">主题</th>
                <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">标题</th>
                <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">评分</th>
                <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">日期</th>
              </tr>
            </thead>
            <tbody>
              {recentExperiments.map((exp) => (
                <tr key={exp.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm text-gray-900">{exp.topic}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{exp.title}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-sm font-medium ${
                        exp.score >= 4.5
                          ? 'bg-green-100 text-green-700'
                          : exp.score >= 3
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {exp.score}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{exp.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
