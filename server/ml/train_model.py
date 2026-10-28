import os
import json
from pathlib import Path
import numpy as np
import pandas as pd
import joblib
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

BASE_DIR = Path(r"c:\Users\Shubham\Desktop\My Works\DV Mini Project")
OUTPUT_DIR = BASE_DIR / "server" / "ml"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

powerbi_csv = BASE_DIR / "aqi_outputs" / "mumbai_navi_mumbai_aqi_powerbi.csv"
if not powerbi_csv.exists():
    raise FileNotFoundError(f"Missing {powerbi_csv}")

df = pd.read_csv(powerbi_csv)
print(f"Loaded {len(df)} rows from {powerbi_csv}")

pollutant_cols = [
    "pm2_5", "pm10", "no", "no2", "nox", "nh3",
    "co", "so2", "o3", "benzene", "toluene", "xylene"
]
pollutant_cols = [c for c in pollutant_cols if c in df.columns]

df["date"] = pd.to_datetime(df["date"], errors="coerce")
for col in ["aqi"] + pollutant_cols:
    df[col] = pd.to_numeric(df[col], errors="coerce")

clean = df.dropna(subset=["date", "aqi"]).copy()
clean = clean[clean["aqi"] >= 0].sort_values("date").reset_index(drop=True)

split_at = int(len(clean) * 0.80)
train_df = clean.iloc[:split_at].copy()
test_df = clean.iloc[split_at:].copy()

model_feature_cols = [c for c in pollutant_cols if train_df[c].notna().any()]
print("Model features:", model_feature_cols)

X_train = train_df[model_feature_cols]
y_train = train_df["aqi"]
X_test = test_df[model_feature_cols]
y_test = test_df["aqi"]

model = Pipeline(steps=[
    ("imputer", SimpleImputer(strategy="median")),
    ("rf", RandomForestRegressor(
        n_estimators=300,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    ))
])

model.fit(X_train, y_train)
y_pred = model.predict(X_test)

mae = float(mean_absolute_error(y_test, y_pred))
rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
r2 = float(r2_score(y_test, y_pred))

print(f"Model trained! MAE: {mae:.2f}, RMSE: {rmse:.2f}, R2: {r2:.4f}")

rf = model.named_steps["rf"]
importances = rf.feature_importances_.tolist()
feature_importance = [
    {"feature": col, "importance": round(float(imp), 4), "percentage": round(float(imp) * 100, 2)}
    for col, imp in sorted(zip(model_feature_cols, importances), key=lambda x: x[1], reverse=True)
]

imputer = model.named_steps["imputer"]
medians = {col: round(float(m), 2) for col, m in zip(model_feature_cols, imputer.statistics_)}

min_max = {}
for col in model_feature_cols:
    min_max[col] = {
        "min": round(float(clean[col].min()), 2) if clean[col].notna().any() else 0.0,
        "max": round(float(clean[col].max()), 2) if clean[col].notna().any() else 100.0,
        "median": medians[col]
    }

metadata = {
    "model_name": "RandomForestRegressor",
    "target": "aqi",
    "features": model_feature_cols,
    "metrics": {
        "MAE": round(mae, 4),
        "RMSE": round(rmse, 4),
        "R2": round(r2, 4),
        "train_rows": len(train_df),
        "test_rows": len(test_df),
        "split_ratio": "80/20 Chronological"
    },
    "feature_importance": feature_importance,
    "feature_statistics": min_max,
    "training_date_range": {
        "start": str(train_df["date"].min().date()),
        "end": str(train_df["date"].max().date())
    },
    "test_date_range": {
        "start": str(test_df["date"].min().date()),
        "end": str(test_df["date"].max().date())
    }
}

model_file = OUTPUT_DIR / "model.joblib"
joblib.dump(model, model_file)
print(f"Saved model to {model_file}")

meta_file = OUTPUT_DIR / "metadata.json"
with open(meta_file, "w", encoding="utf-8") as f:
    json.dump(metadata, f, indent=2)
print(f"Saved metadata to {meta_file}")
