import { useState } from 'react'
import { ClipboardCheck, Loader2, Lightbulb } from 'lucide-react'
import ScoreCard from '../components/ScoreCard'

export default function Scorer() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isScoring, setIsScoring] = useState(false)
  const [result, setResult] = useState(null)

  const handleScore = async () => {
    if (!title.trim() || !content.trim()) return

    setIsScoring(true)

    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
      }
    } catch {
      // Mock result for demo
      setResult({
        total_score: 4.5,
        dimension_scores: {
          opening_hook: 1.0,
          life_metaphor: 0.8,
          verifiable_numbers: 0.7,
          no_cliches: 1.0,
          specific_question: 0.5,
          word_count: 1.0,
        },
        feedback: '内容质量不错！建议结尾问句更具体一些。',
      })
    } finally {
      setIsScoring(false)
    }
  }

  const handleReset = () => {
    setTitle('')
    setContent('')
    setResult(null)
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">内容评分</h2>
        <p className="text-gray-500 mt-1">基于 6 维度体系评估内容质量</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">输入内容</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  标题
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="输入笔记标题"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  正文
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="输入笔记正文内容..."
                  rows={12}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  字数: {content.length} (建议 150-600)
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleScore}
                  disabled={isScoring || !title.trim() || !content.trim()}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isScoring ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      评分中...
                    </>
                  ) : (
                    <>
                      <ClipboardCheck size={18} />
                      开始评分
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  重置
                </button>
              </div>
            </div>
          </div>

          {/* Scoring Dimensions Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">评分维度</h3>
            <div className="space-y-3">
              {[
                { n: 1, label: '开场钩子', desc: '第一句话有具体数字或强反差' },
                { n: 2, label: '生活比喻', desc: '用日常生活比喻解释概念' },
                { n: 3, label: '可验证数字', desc: '有具体可验证的效果数据' },
                { n: 4, label: '无套话', desc: '避免"效果很好"等空话' },
                { n: 5, label: '具体问句', desc: '结尾问句用户可直接回答' },
                { n: 6, label: '字数范围', desc: '字数在 150-600 字之间' },
              ].map(({ n, label, desc }) => (
                <div key={n} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm flex items-center justify-center font-medium">
                    {n}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Result */}
        <div>
          {result ? (
            <div className="space-y-4">
              <ScoreCard
                scores={result.dimension_scores}
                totalScore={result.total_score}
              />

              {result.feedback && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Lightbulb size={18} className="text-amber-500" />
                    改进建议
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    {result.feedback.split('\n').map((line, i) => (
                      <p key={i} className="text-gray-700 text-sm mb-2 last:mb-0">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {result.total_score >= 4.5 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-green-700 font-medium">
                    ✨ 评分达标，建议发布
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center h-full flex flex-col items-center justify-center">
              <ClipboardCheck size={48} className="text-gray-300 mb-4" />
              <p className="text-gray-500">输入内容并点击评分</p>
              <p className="text-sm text-gray-400 mt-1">结果将在右侧显示</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
