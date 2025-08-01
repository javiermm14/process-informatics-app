# プロセスインフォマティクス ウェブアプリ

材料投入・撹拌・温度条件から品質を予測、または品質から条件を推定するWebアプリケーション

## 機能

1. **品質予測**: 材料A投入時間、材料B投入時間、撹拌速度、温度から硬度と質量を予測
2. **条件推定**: 目標硬度と質量から最適な投入条件を推定

## 技術スタック

- **フロントエンド**: Next.js 15 + TypeScript + Tailwind CSS
- **バックエンド**: Python + FastAPI + NumPy + Scikit-learn

## セットアップ

### バックエンド (Python)

```bash
cd backend
pip install -r requirements.txt
python main.py
```

バックエンドはhttp://localhost:8000で起動します

### フロントエンド (Next.js)

```bash
cd frontend
npm install
npm run dev
```

フロントエンドはhttp://localhost:3000で起動します

## 使用方法

1. バックエンドとフロントエンドの両方を起動
2. ブラウザでhttp://localhost:3000にアクセス
3. 「品質予測」または「条件推定」モードを選択
4. 条件を入力して予測/推定を実行

## API エンドポイント

- `POST /predict`: 条件から品質を予測
- `POST /estimate`: 品質から条件を推定
- `GET /`: API情報

## 入力変数

- 材料A投入ゲート開時間 (秒)
- 材料B投入ゲート開時間 (秒)
- 撹拌速度 (rpm)
- 温度 (°C)

## 出力変数

- 硬度
- 質量 (g)

---

## 対策

1. **ポート8000を使っているプロセスが完全に終了しているか再度確認**
   - コマンドプロンプトで以下を実行してください：
     ```
     netstat -ano | findstr :8000
     ```
   - もし何か表示されたら、そのPIDを
     ```
     taskkill /PID <PID番号> /F
     ```
     で強制終了してください。

2. **どうしても解放できない場合は、別のポートでサーバーを起動する**
   - 例：`uvicorn main:app --port 8001` で8001番ポートで起動できます。

---

どちらかの方法で再度サーバーを起動し、  
「INFO:     Application startup complete.」の後にエラーが出なければOKです。

ご希望の方法を教えていただければ、コマンド例もご案内します！

---

もし操作方法が分からない場合や、他のエラーが出る場合はご相談ください！