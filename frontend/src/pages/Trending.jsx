import { TrendingUp, BarChart3, Tag } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const topWords = [
  { word: '护肤', count: 89 },
  { word: '穿搭', count: 76 },
  { word: '平价', count: 65 },
  { word: '好物', count: 58 },
  { word: '分享', count: 54 },
  { word: '测评', count: 49 },
  { word: '推荐', count: 47 },
  { word: '教程', count: 43 },
  { word: '日常', count: 38 },
  { word: '必备', count: 35 },
]

const patterns = [
  { name: '数字开头', count: 45, example: '7天淡纹，我找到了...' },
  { name: '疑问句标题', count: 38, example: '为什么你涂口红显老？' },
  { name: '强反差对比', count: 32, example: '从路人甲到焦点...' },
  { name: '身份代入', count: 28, example: '作为一个油皮...' },
  { name: '解决方案型', count: 25, example: '3招教你搞定...' },
]

const sampleNotes = [
  {
    title: '7天淡纹，我找到了平价替代！',
    author: '美妆达人小A',
    likes: 23400,
    collects: 8900,
    tags: ['护肤', '平价好物', '抗老'],
  },
  {
    title: '学生党穿搭｜这套显瘦10斤！',
    author: '穿搭日记',
    likes: 18900,
    collects: 6700,
    tags: ['穿搭', '学生党', '显瘦'],
  },
  {
    title: '100元搞定全套护肤！平价版贵妇体验',
    author: '护肤心得',
    likes: 15600,
    collects: 5400,
    tags: ['护肤', '平价', '学生党'],
  },
  {
    title: '油皮夏日控油攻略｜24小时实测',
    author: '油皮妹子',
    likes: 12300,
    collects: 4500,
    tags: ['护肤', '油皮', '控油'],
  },
]

const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4']

export default function Trending() {
  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">爆款分析</h2>
        <p className="text-gray-500 mt-1">基于高互动内容的规律总结</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">156</p>
              <p className="text-sm text-gray-500">分析样本数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <BarChart3 size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">18.5k</p>
              <p className="text-sm text-gray-500">平均点赞</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Tag size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">89%</p>
              <p className="text-sm text-gray-500">数字开头率</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* High Frequency Words */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">高频词汇 TOP 10</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topWords} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="word"
                  tick={{ fontSize: 12 }}
                  width={60}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {topWords.map((_, index) => (
                    <Cell key={index} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* High Frequency Patterns */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">爆款模式</h3>
          <div className="space-y-4">
            {patterns.map((pattern, i) => (
              <div key={pattern.name} className="flex items-start gap-3">
                <span
                  className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded text-sm flex items-center justify-center font-medium"
                >
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{pattern.name}</p>
                    <span className="text-sm text-gray-500">{pattern.count}%</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{pattern.example}</p>
                  <div className="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pattern.count}%`, backgroundColor: colors[i] }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sample Notes */}
      <div className="mt-6">
        <h3 className="font-semibold text-gray-900 mb-4">爆款案例</h3>
        <div className="grid grid-cols-2 gap-4">
          {sampleNotes.map((note, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    i === 0
                      ? 'bg-yellow-100 text-yellow-700'
                      : i === 1
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {i === 0 ? 'TOP 1' : i === 1 ? 'TOP 2' : `TOP ${i + 1}`}
                </span>
                <div className="text-right text-sm">
                  <span className="text-gray-900">{note.likes.toLocaleString()} 👍</span>
                </div>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">{note.title}</h4>
              <p className="text-xs text-gray-500 mb-3">@{note.author}</p>
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
