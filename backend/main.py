from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from typing import Dict, Any, List
from fastapi import Body
import sys
sys.path.append("..")
from connection_plc import operate_plc

app = FastAPI(title="プロセスインフォマティクス API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProcessConditions(BaseModel):
    gate_a_time: float
    gate_b_time: float
    stir_speed: float
    temperature: float

class QualityMetrics(BaseModel):
    hardness: float
    mass: float

class PredictionResponse(BaseModel):
    hardness: float
    mass: float

class EstimationResponse(BaseModel):
    gate_a_time: float
    gate_b_time: float
    stir_speed: float
    temperature: float

class PLCWriteRequest(BaseModel):
    write_values: List[int] = [1, 1, 1, 1]

def predict_quality(conditions: ProcessConditions) -> PredictionResponse:
    """条件から品質を予測する関数"""
    # 簡単な線形モデル（実際はもっと複雑なモデルを使用）
    hardness = (
        conditions.gate_a_time * 2.5 +
        conditions.gate_b_time * 1.8 +
        conditions.stir_speed * 0.15 +
        conditions.temperature * 0.3 +
        np.random.normal(0, 2)
    )
    
    mass = (
        conditions.gate_a_time * 8.5 +
        conditions.gate_b_time * 6.2 +
        conditions.stir_speed * 0.05 +
        conditions.temperature * 0.8 +
        np.random.normal(0, 5)
    )
    
    return PredictionResponse(
        hardness=round(max(0, hardness), 2),
        mass=round(max(0, mass), 2)
    )

def estimate_conditions(quality: QualityMetrics) -> EstimationResponse:
    """品質から条件を推定する関数"""
    # 逆計算による推定（実際はより sophisticated なアルゴリズムを使用）
    base_gate_a = (quality.hardness - quality.mass * 0.1) / 3.0
    base_gate_b = (quality.mass - quality.hardness * 0.5) / 8.0
    base_stir_speed = (quality.hardness + quality.mass) * 2.0
    base_temperature = (quality.hardness + quality.mass * 0.3) / 2.0
    
    # 制約を適用
    gate_a_time = max(1.0, min(20.0, base_gate_a + np.random.normal(0, 0.5)))
    gate_b_time = max(1.0, min(20.0, base_gate_b + np.random.normal(0, 0.5)))
    stir_speed = max(50.0, min(200.0, base_stir_speed + np.random.normal(0, 5)))
    temperature = max(60.0, min(100.0, base_temperature + np.random.normal(0, 2)))
    
    return EstimationResponse(
        gate_a_time=round(gate_a_time, 1),
        gate_b_time=round(gate_b_time, 1),
        stir_speed=round(stir_speed, 0),
        temperature=round(temperature, 1)
    )

@app.get("/")
async def root():
    return {"message": "プロセスインフォマティクス API"}

@app.post("/predict", response_model=PredictionResponse)
async def predict_quality_endpoint(conditions: ProcessConditions):
    """条件から品質を予測するエンドポイント"""
    return predict_quality(conditions)

@app.post("/estimate", response_model=EstimationResponse)
async def estimate_conditions_endpoint(quality: QualityMetrics):
    """品質から条件を推定するエンドポイント"""
    return estimate_conditions(quality)

@app.post("/send_to_plc")
async def send_to_plc(request: PLCWriteRequest = Body(...)):
    """PLCに値を書き込み、状態を返すエンドポイント"""
    result = operate_plc(write_values=request.write_values)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)