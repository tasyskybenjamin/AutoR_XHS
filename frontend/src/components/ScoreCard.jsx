import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'

const dimensionNames = {
  opening_hook: '开场钩子',
  life_metaphor: '生活比喻',
  verifiable_numbers: '可验证数字',
  no_cliches: '无套话',
  specific_question: '具体问句',
  word_count: '字数范围',
}

export default function ScoreCard({ scores, totalScore }) {
  const data = Object.entries(scores).map(([key, value]) => ({
    subject: dimensionNames[key] || key,
    value: value * 100,
    fullMark: 100,
  }))

  const scoreColor = totalScore >= 4.5 ? '#10b981' : totalScore >= 3 ? '#f59e0b' : '#ef4444'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">内容评分</h3>
        <div className="flex items-center gap-2">
          <span
            className="text-3xl font-bold"
            style={{ color: scoreColor }}
          >
            {totalScore.toFixed(1)}
          </span>
          <span className="text-gray-400">/6</span>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <Radar
              name="评分"
              dataKey="value"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 space-y-2">
        {Object.entries(scores).map(([key, value]) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-24">{dimensionNames[key]}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${value * 100}%`,
                  backgroundColor: value >= 0.8 ? '#10b981' : value >= 0.5 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700 w-12 text-right">
              {(value * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
