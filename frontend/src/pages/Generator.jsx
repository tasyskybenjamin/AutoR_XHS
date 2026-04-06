import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import ContentCard from '../components/ContentCard'
import ScoreCard from '../components/ScoreCard'

const nicheOptions = [
  '美妆/穿搭/生活',
  '美食/探店',
  '旅游/生活方式',
  '科技/数码',
  '其他',
]

const goalOptions = [
  '提升点赞和收藏',
  '提升评论互动',
  '吸引新粉丝',
  '增加分享',
]

export default function Generator() {
  const [topic, setTopic] = useState('')
  const [niche, setNiche] = useState(nicheOptions[0])
  const [goal, setGoal] = useState(goalOptions[0])
  const [numCandidates, setNumCandidates] = useState(3)
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const handleGenerate = async () => {
    if (!topic.trim()) return

    setIsGenerating(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, niche, goal, num_candidates: numCandidates }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || '生成失败')
      }

      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">内容生成</h2>
        <p className="text-gray-500 mt-1">AI 帮你生成高质量小红书内容</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Form */}
        <div className="col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
            <h3 className="font-semibold text-gray-900 mb-4">生成设置</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  内容主题
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="例如：春季护肤routine分享"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  账号定位
                </label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {nicheOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  实验目标
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {goalOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  生成数量: {numCandidates}
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={numCandidates}
                  onChange={(e) => setNumCandidates(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    开始生成
                  </>
                )}
              </button>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="col-span-2">
          {results && !error ? (
            <div className="space-y-6">
              {/* Best Result */}
              {(results.best_candidate || results.candidates?.[0]) && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-yellow-500">🏆</span>
                    最优推荐
                  </h3>
                  <ContentCard
                    content={results.best_candidate || results.candidates[0]}
                    rank={1}
                  />
                  <div className="mt-4">
                    <ScoreCard
                      scores={(results.best_candidate || results.candidates[0]).dimension_scores}
                      totalScore={(results.best_candidate || results.candidates[0]).score}
                    />
                  </div>
                </div>
              )}

              {/* Other Candidates */}
              {results.candidates?.length > 1 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">其他候选</h3>
                  <div className="space-y-4">
                    {results.candidates.slice(1).map((c, i) => (
                      <ContentCard key={i} content={c} rank={i + 2} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Sparkles size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">填写左侧表单，点击生成按钮</p>
              <p className="text-sm text-gray-400 mt-1">AI 将为你生成多个内容候选</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
