import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function Home() {
  // グラフ表示用の状態
  const [input, setInput] = useState("");
  const [data, setData] = useState<number[]>([]);

  // 逆モデル用の状態
  const [hardness, setHardness] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState<string | null>(null);

  // Forwardモデル用の状態
  const [liquidA, setLiquidA] = useState("");
  const [liquidB, setLiquidB] = useState("");
  const [temperature, setTemperature] = useState("");
  const [stirring, setStirring] = useState("");
  const [prediction, setPrediction] = useState<{
    hardness: string;
    yield: string;
    defect: string;
  } | null>(null);

  // ローディング用の状態
  const [loadingSuggest, setLoadingSuggest] = useState(false);

  // 初期表示時にランダムなデータを生成
  useEffect(() => {
    const generateRandomData = () => {
      const randomData = Array.from({ length: 10 }, () => 
        Math.floor(Math.random() * 100)
      );
      setData(randomData);
      setInput(randomData.join(", "));
    };
    generateRandomData();
  }, []);

  const handleSubmit = () => {
    const parsed = input.split(",").map(Number);
    setData(parsed);
  };

  const handleSuggest = async () => {
    setLoadingSuggest(true);
    setResult(null);
    setTimeout(() => {
      const suggestion = `液体A 70g、B 30g、温度42℃、撹拌180rpm → 期待硬度 ${hardness || "??"}（重量 ${weight || "??"}g）`;
      setResult(suggestion);
      setLoadingSuggest(false);
    }, 5000);
  };

  const handleTransmitToPLC = async () => {
    if (!result) return;

    try {
      // 製造パラメータの作成
      const parameters = {
        液体A: Math.floor(Number(weight) * 0.7),
        液体B: Math.floor(Number(weight) * 0.3),
        温度: 42,
        撹拌速度: 180,
        目標硬度: Number(hardness),
        目標重量: Number(weight)
      };

      // APIを呼び出してPLCに送信
      const response = await fetch('/api/transmit-to-plc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parameters
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('PLCへの送信が完了しました');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('送信エラー:', error);
      alert('PLCへの送信に失敗しました');
    }
  };

  const handlePredict = () => {
    // 本来はここでAPIに投げるなどの処理を行う
    // 今はダミーデータで返す
    setPrediction({
      hardness: `${Math.floor(Math.random() * 20) + 80} ±2`,
      yield: `${Math.floor(Math.random() * 10) + 90}%`,
      defect: `${Math.floor(Math.random() * 5)}%`
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-16">
      {/* グラフ表示セクション */}
      <section className="bg-white rounded-lg shadow-md p-6 space-y-4 transform hover:scale-[1.01] transition-transform">
        <h2 className="text-2xl font-bold text-gray-800">データ可視化</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition"
            placeholder="例: 10, 20, 30"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className="bg-[#FF6B00] text-white px-6 py-3 rounded-lg hover:bg-[#FF8C00] transition-colors shadow-md"
            onClick={handleSubmit}
          >
            グラフに表示
          </button>
          {data.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <Line
                data={{
                  labels: data.map((_, i) => `点${i + 1}`),
                  datasets: [
                    {
                      label: "入力値グラフ",
                      data: data,
                      borderColor: "#FF6B00",
                      backgroundColor: "rgba(255, 107, 0, 0.1)",
                      tension: 0.4,
                      fill: true,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                    },
                  },
                }}
              />
            </div>
          )}
        </div>
      </section>

      {/* 1. 逆モデル */}
      <section className="bg-white rounded-lg shadow-md p-6 space-y-4 transform hover:scale-[1.01] transition-transform">
        <h2 className="text-2xl font-bold text-gray-800">AIによる製造条件の逆算（逆モデル）</h2>
        <p className="text-gray-600">目標とする品質を入力してください。AIが推奨される製造条件を表示します。</p>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="number"
              placeholder="目標硬度（例: 90）"
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition w-full"
              value={hardness}
              onChange={(e) => setHardness(e.target.value)}
            />
            <input
              type="number"
              placeholder="目標重量（g）（例: 100）"
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition w-full"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <button
            onClick={handleSuggest}
            className="bg-[#FF6B00] text-white px-6 py-3 rounded-lg hover:bg-[#FF8C00] transition-colors shadow-md w-full sm:w-auto"
            disabled={loadingSuggest}
          >
            {loadingSuggest ? '処理中...' : 'AIに推奨条件を出してもらう'}
          </button>
        </div>

        {loadingSuggest && (
          <div className="flex justify-center items-center mt-4">
            <svg className="animate-spin h-8 w-8 text-[#FF6B00]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          </div>
        )}

        {result && (
          <div className="mt-4 border border-orange-200 p-4 bg-orange-50 rounded-lg">
            <p className="font-medium text-[#FF6B00]">🧠 AI推奨条件：</p>
            <p className="mt-2 text-gray-700">{result}</p>
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <button className="text-[#FF6B00] hover:text-[#FF8C00] transition-colors">
                推奨条件のシミュレーションを実行
              </button>
              <button 
                onClick={handleTransmitToPLC}
                className="bg-[#FF6B00] text-white px-6 py-3 rounded-lg hover:bg-[#FF8C00] transition-colors shadow-md"
              >
                PLCに送信
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 2. Forward予測モデル */}
      <section className="bg-white rounded-lg shadow-md p-6 space-y-4 transform hover:scale-[1.01] transition-transform">
        <h2 className="text-2xl font-bold text-gray-800">AIによる品質予測（Forwardモデル）</h2>
        <p className="text-gray-600">製造条件を入力すると、AIが予測される品質特性を即座に表示します。</p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">液体Aの割合 (%)</label>
              <input
                type="number"
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition w-full"
                placeholder="例: 70"
                value={liquidA}
                onChange={(e) => setLiquidA(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">液体Bの割合 (%)</label>
              <input
                type="number"
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition w-full"
                placeholder="例: 30"
                value={liquidB}
                onChange={(e) => setLiquidB(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">温度 (℃)</label>
              <input
                type="number"
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition w-full"
                placeholder="例: 42"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">撹拌速度 (rpm)</label>
              <input
                type="number"
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition w-full"
                placeholder="例: 180"
                value={stirring}
                onChange={(e) => setStirring(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={handlePredict}
            className="bg-[#FF6B00] text-white px-6 py-3 rounded-lg hover:bg-[#FF8C00] transition-colors shadow-md w-full sm:w-auto"
          >
            品質を予測する
          </button>
        </div>

        {prediction && (
          <div className="mt-4 border border-gray-200 rounded-lg p-6 bg-gray-50 space-y-4">
            <p className="text-lg font-medium text-gray-700">🔍 この条件では予測される品質：</p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="w-24 text-gray-600">硬度：</span>
                <span className="font-bold text-[#FF6B00]">{prediction.hardness}</span>
              </li>
              <li className="flex items-center">
                <span className="w-24 text-gray-600">収率：</span>
                <span className="font-bold text-[#FF6B00]">{prediction.yield}</span>
              </li>
              <li className="flex items-center">
                <span className="w-24 text-gray-600">不良率：</span>
                <span className="font-bold text-[#FF6B00]">{prediction.defect}</span>
              </li>
            </ul>
          </div>
        )}
      </section>

      {/* 3. 感度分析 */}
      <section className="bg-white rounded-lg shadow-md p-6 space-y-4 transform hover:scale-[1.01] transition-transform">
        <h2 className="text-2xl font-bold text-gray-800">重要因子ランキング</h2>
        <p className="text-gray-600">AIが品質に影響を与えるパラメータを分析し、ランキング形式で提示します。</p>

        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 space-y-4">
          <p className="text-lg font-medium text-gray-700">📊 品質に対する影響度：</p>
          <ul className="space-y-3">
            <li className="flex items-center">
              <span className="w-32 text-gray-600">撹拌時間：</span>
              <span className="text-[#FF6B00]">★★★★★</span>
            </li>
            <li className="flex items-center">
              <span className="w-32 text-gray-600">温度：</span>
              <span className="text-[#FF6B00]">★★★</span>
            </li>
            <li className="flex items-center">
              <span className="w-32 text-gray-600">混合比：</span>
              <span className="text-[#FF6B00]">★★</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}