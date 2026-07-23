import os
import sys
import shutil

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

def deploy_model_to_backend():
    """
    Copies trained model pickle and dataset from model_training/
    directly into backend/ml/ and datasets/ for live API integration.
    """
    src_model = "model_training/loan_model.pkl"
    dest_model = "backend/ml/loan_approval_model.pkl"

    src_csv = "model_training/dataset.csv"
    dest_csv = "datasets/loan_data.csv"

    print("🚀 Integrating trained model with backend application...")

    if os.path.exists(src_model):
        os.makedirs(os.path.dirname(dest_model), exist_ok=True)
        shutil.copy(src_model, dest_model)
        print(f"✅ Model deployed: Copied '{src_model}' ➔ '{dest_model}'")
    else:
        print(f"⚠️ Warning: Model '{src_model}' not found. Please run 'python model_training/train.py' first.")

    if os.path.exists(src_csv):
        os.makedirs(os.path.dirname(dest_csv), exist_ok=True)
        shutil.copy(src_csv, dest_csv)
        print(f"✅ Dataset synced: Copied '{src_csv}' ➔ '{dest_csv}'")

    print("\n🎉 Integration Complete! The FastAPI backend is now ready with your trained model.")

if __name__ == "__main__":
    deploy_model_to_backend()
