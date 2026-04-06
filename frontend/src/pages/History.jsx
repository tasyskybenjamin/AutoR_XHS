import { useState } from 'react'
import { History as HistoryIcon, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react'

const mockHistory = [
  {
    id: 1,
    date: '2026-04-06 14:30',
    topic: '春季护肤routine',
    title: '7天养出好皮肤，我做对了这三件事',
    score: 5.5,
    likes: 1234,
    collects: 567,
    comments: 89,
    verdict: 'keep',
  },
  {
    id: 2,
    date: '2026-04-05 10:15',
    topic: '显瘦穿搭技巧',
    title: '3招告别臃肿，穿出好身材',
    score: 4.2,
    likes: 456,
    collects: 123,
    comments: 34,
    verdict: 'keep',
  },
  {
    id: 3,
    date: '2026-04-04 16:45',
    topic: '平价好物推荐',
    title: '100元搞定全套护肤',
    score: 4.8,
    likes: 2341,
    collects: 892,
    comments: 156,
    verdict: 'keep',
  },
  {
    id: 4,
    date: '2026-04-03 09:20',
    topic: '妆容教程',
    title: '新手化妆常犯的5个错误',
    score: 3.5,
    likes: 234,
    collects: 67,
    comments: 23,
    verdict: 'discard',
  },
  {
    id: 5,
    date: '2026-04-02 11:30',
    topic: '护肤成分科普',
    title: '玻尿酸真的有用吗？',
    score: 4.0,
    likes: 567,
    collects: 234,
    comments: 45,
    verdict: 'keep',
  },
]

export default function ExperimentHistory() {
  const [expandedId, setExpandedId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterVerdict, setFilterVerdict] = useState('all')

  const filteredHistory = mockHistory.filter((item) => {
    const matchesSearch =
      item.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterVerdict === 'all' || item.verdict === filterVerdict
    return matchesSearch && matchesFilter
  })

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">实验历史</h2>
        <p className="text-gray-500 mt-1">查看所有内容生成实验记录</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索主题或标题..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={filterVerdict}
            onChange={(e) => setFilterVerdict(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">全部</option>
            <option value="keep">保留</option>
            <option value="discard">丢弃</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-2xl font-bold text-gray-900">{mockHistory.length}</p>
          <p className="text-sm text-gray-500">总实验数</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-2xl font-bold text-green-600">
            {mockHistory.filter((h) => h.verdict === 'keep').length}
          </p>
          <p className="text-sm text-gray-500">保留</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-2xl font-bold text-red-600">
            {mockHistory.filter((h) => h.verdict === 'discard').length}
          </p>
          <p className="text-sm text-gray-500">丢弃</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-2xl font-bold text-blue-600">
            {(mockHistory.reduce((acc, h) => acc + h.score, 0) / mockHistory.length).toFixed(1)}
          </p>
          <p className="text-sm text-gray-500">平均评分</p>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center">
            <HistoryIcon size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">暂无实验记录</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredHistory.map((item) => (
              <div key={item.id}>
                <div
                  className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(item.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            item.score >= 4.5
                              ? 'bg-green-100 text-green-700'
                              : item.score >= 3
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {item.score}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            item.verdict === 'keep'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {item.verdict === 'keep' ? '已发布' : '已丢弃'}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500 mt-0.5">{item.topic}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-900">{item.likes} 👍</p>
                        <p className="text-xs text-gray-500">{item.collects} ⭐</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{item.date}</p>
                        <p className="text-xs text-gray-400">{item.comments} 💬</p>
                      </div>
                      {expandedId === item.id ? (
                        <ChevronUp size={20} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedId === item.id && (
                  <div className="px-5 pb-5 bg-gray-50">
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-3">
                        <strong>详细数据：</strong>
                      </p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">点赞：</span>
                          <span className="font-medium">{item.likes}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">收藏：</span>
                          <span className="font-medium">{item.collects}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">评论：</span>
                          <span className="font-medium">{item.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
