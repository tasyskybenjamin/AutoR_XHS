import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

export default function ContentCard({ content, rank = 1, onCopy }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const text = `${content.title}\n\n${content.content}\n\n${content.tags.join(' ')}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onCopy?.()
  }

  const rankBadge = {
    1: { bg: 'bg-yellow-500', text: '🥇' },
    2: { bg: 'bg-gray-400', text: '🥈' },
    3: { bg: 'bg-amber-600', text: '🥉' },
  }

  const badge = rankBadge[rank] || { bg: 'bg-blue-500', text: `#${rank}` }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`${badge.bg} text-white text-xs px-2 py-0.5 rounded`}>
              {badge.text}
            </span>
            <span className="text-sm text-gray-500">评分 {content.score?.toFixed(1) || 'N/A'}</span>
          </div>
          <button
            onClick={handleCopy}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="复制内容"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>

        {/* Title */}
        <h4 className="text-lg font-semibold text-gray-900 mb-2">{content.title}</h4>

        {/* Cover Text */}
        {content.cover_text && (
          <div className="inline-block px-3 py-1 bg-gray-100 rounded text-sm text-gray-700 mb-3">
            封面: {content.cover_text}
          </div>
        )}

        {/* Content Preview */}
        <p className="text-gray-600 text-sm line-clamp-4 mb-4">{content.content}</p>

        {/* Tags */}
        {content.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {content.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Feedback */}
        {content.feedback && content.feedback !== '✨ 内容质量良好！' && (
          <div className="mt-4 p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
            {content.feedback}
          </div>
        )}
      </div>
    </div>
  )
}
