'use client'

import { useState } from 'react'

interface ProcessConditions {
  gate_a_time: number
  gate_b_time: number
  stir_speed: number
  temperature: number
}

interface QualityMetrics {
  hardness: number
  mass: number
}

export default function Home() {
  const [mode, setMode] = useState<'predict' | 'estimate'>('predict')
  const [loading, setLoading] = useState(false)
  
  // 品質予測モード用の状態
  const [conditions, setConditions] = useState<ProcessConditions>({
    gate_a_time: 10,
    gate_b_time: 8,
    stir_speed: 100,
    temperature: 80
  })
  const [predictedQuality, setPredictedQuality] = useState<QualityMetrics | null>(null)
  
  // 条件推定モード用の状態
  const [targetQuality, setTargetQuality] = useState<QualityMetrics>({
    hardness: 45,
    mass: 120
  })
  const [estimatedConditions, setEstimatedConditions] = useState<ProcessConditions | null>(null)

  const predictQuality = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conditions)
      })
      const result = await response.json()
      setPredictedQuality(result)
    } catch (error) {
      console.error('予測エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const estimateConditions = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(targetQuality)
      })
      const result = await response.json()
      setEstimatedConditions(result)
    } catch (error) {
      console.error('推定エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center">
          <h1 className="text-4xl font-bold mb-2">プロセスインフォマティクス</h1>
          <p className="text-xl opacity-90">材料投入・撹拌・温度条件から品質を予測、または品質から条件を推定</p>
        </div>

        {/* モード選択 */}
        <div className="p-8 bg-gray-50">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setMode('predict')}
              className={`px-8 py-3 rounded-full font-semibold transition-all ${
                mode === 'predict'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform -translate-y-1'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              品質予測
            </button>
            <button
              onClick={() => setMode('estimate')}
              className={`px-8 py-3 rounded-full font-semibold transition-all ${
                mode === 'estimate'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform -translate-y-1'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              条件推定
            </button>
          </div>
        </div>

        {/* 品質予測モード */}
        {mode === 'predict' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">品質予測（条件 → 品質）</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  材料A投入ゲート開時間 (秒)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={conditions.gate_a_time}
                  onChange={(e) => setConditions({...conditions, gate_a_time: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  材料B投入ゲート開時間 (秒)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={conditions.gate_b_time}
                  onChange={(e) => setConditions({...conditions, gate_b_time: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  撹拌速度 (rpm)
                </label>
                <input
                  type="number"
                  step="10"
                  value={conditions.stir_speed}
                  onChange={(e) => setConditions({...conditions, stir_speed: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  温度 (°C)
                </label>
                <input
                  type="number"
                  step="1"
                  value={conditions.temperature}
                  onChange={(e) => setConditions({...conditions, temperature: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={predictQuality}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:shadow-lg transform hover:-translate-y-1 transition-all disabled:opacity-50"
            >
              {loading ? '予測中...' : '品質を予測'}
            </button>

            {predictedQuality && (
              <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                <h3 className="text-xl font-bold text-center mb-4 text-gray-800">予測結果</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <span className="text-gray-600">硬度:</span>
                    <span className="ml-2 text-2xl font-bold text-blue-600">{predictedQuality.hardness}</span>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <span className="text-gray-600">質量:</span>
                    <span className="ml-2 text-2xl font-bold text-purple-600">{predictedQuality.mass}g</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 条件推定モード */}
        {mode === 'estimate' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">条件推定（品質 → 条件）</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  目標硬度
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={targetQuality.hardness}
                  onChange={(e) => setTargetQuality({...targetQuality, hardness: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  目標質量 (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={targetQuality.mass}
                  onChange={(e) => setTargetQuality({...targetQuality, mass: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={estimateConditions}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:shadow-lg transform hover:-translate-y-1 transition-all disabled:opacity-50"
            >
              {loading ? '推定中...' : '条件を推定'}
            </button>

            {estimatedConditions && (
              <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                <h3 className="text-xl font-bold text-center mb-4 text-gray-800">推定結果</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <span className="text-gray-600">材料A投入ゲート開時間:</span>
                    <span className="ml-2 text-xl font-bold text-blue-600">{estimatedConditions.gate_a_time}秒</span>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <span className="text-gray-600">材料B投入ゲート開時間:</span>
                    <span className="ml-2 text-xl font-bold text-purple-600">{estimatedConditions.gate_b_time}秒</span>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <span className="text-gray-600">撹拌速度:</span>
                    <span className="ml-2 text-xl font-bold text-green-600">{estimatedConditions.stir_speed}rpm</span>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <span className="text-gray-600">温度:</span>
                    <span className="ml-2 text-xl font-bold text-red-600">{estimatedConditions.temperature}°C</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}