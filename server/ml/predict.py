import sys
import json
from pathlib import Path
import numpy as np
import pandas as pd
import joblib

ML_DIR = Path(__file__).resolve().parent
MODEL_PATH = ML_DIR / "model.joblib"
META_PATH = ML_DIR / "metadata.json"

def get_category_info(aqi):
    if aqi <= 50:
        return {
            "category": "Good",
            "color": "#10b981", # emerald-500
            "severity": "minimal",
            "description": "Air quality is considered satisfactory, and air pollution poses little or no risk.",
            "advisory": "Ideal for outdoor activities and exercise."
        }
    elif aqi <= 100:
        return {
            "category": "Satisfactory",
            "color": "#0ea5e9", # sky-500
            "severity": "low",
            "description": "Air quality is acceptable; however, a very small number of sensitive individuals may experience minor breathing discomfort.",
            "advisory": "Safe for general public; sensitive individuals should monitor respiratory symptoms."
        }
    elif aqi <= 200:
        return {
            "category": "Moderate",
            "color": "#f59e0b", # amber-500
            "severity": "moderate",
            "description": "May cause breathing discomfort to people with lung disease, asthma, and heart diseases.",
            "advisory": "Children, the elderly, and individuals with respiratory issues should limit prolonged outdoor exertion."
        }
    elif aqi <= 300:
        return {
            "category": "Poor",
            "color": "#ef4444", # red-500
            "severity": "high",
            "description": "Breathing discomfort to most people on prolonged exposure.",
            "advisory": "Wear N95 masks outdoors; avoid strenuous cardio outside; run air purifiers."
        }
    elif aqi <= 400:
        return {
            "category": "Very Poor",
            "color": "#8b5cf6", # purple-500
            "severity": "very-high",
            "description": "Respiratory illness to the people on prolonged exposure. Pronounced effect on people with lung and heart diseases.",
            "advisory": "Avoid going outdoors, keep windows shut, and use air purification."
        }
    else:
        return {
            "category": "Severe",
            "color": "#881337", # rose-900
            "severity": "critical",
            "description": "Healthy people may experience respiratory symptoms; serious impact on people with existing medical conditions.",
            "advisory": "Emergency warning: Remain indoors. Zero outdoor exertion."
        }

def load_resources():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
    model = joblib.load(MODEL_PATH)
    with open(META_PATH, "r", encoding="utf-8") as f:
        meta = json.load(f)
    return model, meta

def predict_single(input_data):
    model, meta = load_resources()
    features = meta["features"]
    
    # Prepare row
    row = {}
    for feat in features:
        val = input_data.get(feat)
        if val is None or val == "" or str(val).lower() == "nan":
            row[feat] = np.nan
        else:
            try:
                row[feat] = float(val)
            except ValueError:
                row[feat] = np.nan
                
    df_input = pd.DataFrame([row], columns=features)
    predicted_val = float(model.predict(df_input)[0])
    predicted_val = max(0.0, round(predicted_val, 2))
    
    cat_info = get_category_info(predicted_val)
    
    # Analyze input levels vs norms
    pollutant_status = []
    for feat in features:
        val = row.get(feat)
        stats = meta.get("feature_statistics", {}).get(feat, {})
        median_val = stats.get("median", 0)
        max_val = stats.get("max", 100)
        status = "normal"
        if val is not None and not np.isnan(val):
            if val > median_val * 1.5:
                status = "elevated"
            if val > median_val * 2.5:
                status = "critical"
        pollutant_status.append({
            "pollutant": feat,
            "value": None if np.isnan(val) else round(val, 2),
            "median_benchmark": median_val,
            "status": status
        })
        
    return {
        "success": True,
        "predicted_aqi": predicted_val,
        "category": cat_info["category"],
        "color": cat_info["color"],
        "severity": cat_info["severity"],
        "description": cat_info["description"],
        "advisory": cat_info["advisory"],
        "input_features": {k: (None if np.isnan(v) else round(v, 2)) for k, v in row.items()},
        "pollutant_status": pollutant_status,
        "model_metrics": meta["metrics"]
    }

def main():
    if len(sys.argv) > 1:
        raw_input = sys.argv[1]
    else:
        raw_input = sys.stdin.read()
        
    try:
        data = json.loads(raw_input)
    except Exception as e:
        print(json.dumps({"success": False, "error": f"Invalid JSON input: {str(e)}"}))
        sys.exit(1)
        
    try:
        result = predict_single(data)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
