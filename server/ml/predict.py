"""Air Quality Index (AQI) prediction inference module.

Loads the trained Random Forest model and provides categorization and
health advisories based on predicted AQI and pollutant input levels.
"""

import glob
import json
import os
from pathlib import Path
import site
import sys

# Ensure workspace virtualenv and package directories are in sys.path
_BASE_DIR = Path(__file__).resolve().parents[2]
_VENDOR_DIR = Path(__file__).resolve().parent / "vendor"
_SEARCH_PATHS = [
    str(_VENDOR_DIR),
    str(_BASE_DIR / ".venv" / "lib" / "python3.11" / "site-packages"),
    str(_BASE_DIR / ".venv" / "lib" / "python3.10" / "site-packages"),
    str(_BASE_DIR / ".venv" / "lib" / "python3.12" / "site-packages"),
    site.getusersitepackages() if hasattr(site, "getusersitepackages") else "",
    os.path.expanduser("~/.local/lib/python3.11/site-packages"),
    "/opt/render/.local/lib/python3.11/site-packages",
]
for _pattern in [
    str(_BASE_DIR / ".venv" / "lib" / "python*" / "site-packages"),
    os.path.expanduser("~/.local/lib/python*/site-packages"),
    "/opt/render/.local/lib/python*/site-packages",
]:
    _SEARCH_PATHS.extend(glob.glob(_pattern))

for _p in _SEARCH_PATHS:
    if _p and os.path.exists(_p) and _p not in sys.path:
        sys.path.insert(0, _p)

import joblib  # noqa: E402
import numpy as np  # noqa: E402
import pandas as pd  # noqa: E402


ML_DIR = Path(__file__).resolve().parent
MODEL_PATH = ML_DIR / "model.joblib"
META_PATH = ML_DIR / "metadata.json"


def get_category_info(aqi):
    """Return AQI category, color badge, severity, and health advisory."""
    if aqi <= 50:
        return {
            "category": "Good",
            "color": "#10b981",  # emerald-500
            "severity": "minimal",
            "description": (
                "Air quality is considered satisfactory, and air pollution "
                "poses little or no risk."
            ),
            "advisory": "Ideal for outdoor activities and exercise.",
        }
    if aqi <= 100:
        return {
            "category": "Satisfactory",
            "color": "#0ea5e9",  # sky-500
            "severity": "low",
            "description": (
                "Air quality is acceptable; however, a very small number of "
                "sensitive individuals may experience minor breathing "
                "discomfort."
            ),
            "advisory": (
                "Safe for general public; sensitive individuals should "
                "monitor respiratory symptoms."
            ),
        }
    if aqi <= 200:
        return {
            "category": "Moderate",
            "color": "#f59e0b",  # amber-500
            "severity": "moderate",
            "description": (
                "May cause breathing discomfort to people with lung disease, "
                "asthma, and heart diseases."
            ),
            "advisory": (
                "Children, the elderly, and individuals with respiratory "
                "issues should limit prolonged outdoor exertion."
            ),
        }
    if aqi <= 300:
        return {
            "category": "Poor",
            "color": "#ef4444",  # red-500
            "severity": "high",
            "description": (
                "Breathing discomfort to most people on prolonged exposure."
            ),
            "advisory": (
                "Wear N95 masks outdoors; avoid strenuous cardio outside; "
                "run air purifiers."
            ),
        }
    if aqi <= 400:
        return {
            "category": "Very Poor",
            "color": "#8b5cf6",  # purple-500
            "severity": "very-high",
            "description": (
                "Respiratory illness to the people on prolonged exposure. "
                "Pronounced effect on people with lung and heart diseases."
            ),
            "advisory": (
                "Avoid going outdoors, keep windows shut, and use air "
                "purification."
            ),
        }
    return {
        "category": "Severe",
        "color": "#881337",  # rose-900
        "severity": "critical",
        "description": (
            "Healthy people may experience respiratory symptoms; serious "
            "impact on people with existing medical conditions."
        ),
        "advisory": (
            "Emergency warning: Remain indoors. Zero outdoor exertion."
        ),
    }


def load_resources():
    """Load serialized model pipeline and metadata configuration."""
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
    model = joblib.load(MODEL_PATH)
    with open(META_PATH, "r", encoding="utf-8") as file:
        meta = json.load(file)
    return model, meta


def predict_single(input_data):
    """Generate AQI prediction and benchmark analysis for input pollutants."""
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
            "status": status,
        })

    input_feats = {
        k: (None if np.isnan(v) else round(v, 2)) for k, v in row.items()
    }

    return {
        "success": True,
        "predicted_aqi": predicted_val,
        "category": cat_info["category"],
        "color": cat_info["color"],
        "severity": cat_info["severity"],
        "description": cat_info["description"],
        "advisory": cat_info["advisory"],
        "input_features": input_feats,
        "pollutant_status": pollutant_status,
        "model_metrics": meta["metrics"],
    }


def main():
    """Read JSON input from CLI argument or stdin and output prediction."""
    if len(sys.argv) > 1:
        raw_input = sys.argv[1]
    else:
        raw_input = sys.stdin.read()

    try:
        data = json.loads(raw_input)
    except (json.JSONDecodeError, ValueError) as err:
        err_msg = json.dumps({
            "success": False,
            "error": f"Invalid JSON input: {err}",
        })
        print(err_msg)
        sys.exit(1)

    try:
        result = predict_single(data)
        print(json.dumps(result))
    except (ValueError, KeyError, TypeError, RuntimeError, OSError) as err:
        print(json.dumps({"success": False, "error": str(err)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
