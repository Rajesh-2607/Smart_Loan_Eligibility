import os
import sys
import pandas as pd
import numpy as np
import pickle

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

class Logger(object):
    """Dual logger to print to console and write to log file simultaneously."""
    def __init__(self, filename):
        self.terminal = sys.stdout
        self.log = open(filename, "w", encoding="utf-8")

    def write(self, message):
        self.terminal.write(message)
        self.log.write(message)
        self.log.flush()

    def flush(self):
        self.terminal.flush()
        self.log.flush()

def train_lendingclub_model(dataset_path=None, output_model_path=None, log_path=None):
    """
    Trains a Regularized & Calibrated XGBoost Classifier on Kaggle LendingClub features
    across 150 boosting rounds (epochs), logging detailed metrics per round.
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    if dataset_path is None or not os.path.exists(dataset_path):
        for candidate in [dataset_path, "model_training/dataset.csv", os.path.join(base_dir, "dataset.csv"), "dataset.csv"]:
            if candidate and os.path.exists(candidate):
                dataset_path = candidate
                break

    if output_model_path is None:
        output_model_path = os.path.join(base_dir, "loan_model.pkl")

    if log_path is None:
        log_path = os.path.join(base_dir, "training_log.txt")

    # Set up dual stdout logging
    logger = Logger(log_path)
    original_stdout = sys.stdout
    sys.stdout = logger

    try:
        print("=" * 75)
        print("🚀 STARTING REGULARIZED & CALIBRATED XGBOOST TRAINING WITH EPOCH LOGGING")
        print("=" * 75)

        if not dataset_path or not os.path.exists(dataset_path):
            print(f"Error: Dataset file not found.")
            return False

        print(f"Loading Kaggle LendingClub Dataset from '{dataset_path}'...")
        df = pd.read_csv(dataset_path)

        # Feature Engineering & Preprocessing
        grade_map = {'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7}
        df['grade_numeric'] = df['grade'].map(lambda g: grade_map.get(str(g).upper(), 3))

        home_map = {'OWN': 3, 'MORTGAGE': 2, 'RENT': 1}
        df['home_ownership_numeric'] = df['home_ownership'].map(lambda h: home_map.get(str(h).upper(), 1))

        verif_map = {'Verified': 2.0, 'Source Verified': 1.5, 'Not Verified': 1.0}
        df['verification_numeric'] = df['verification_status'].map(lambda v: verif_map.get(str(v).title(), 1.0))

        df['monthly_income'] = df['annual_inc'] / 12
        df['fd_to_loan_ratio'] = df['fixed_deposit'] / (df['loan_amnt'] + 1)
        df['installment_to_inc'] = df['installment'] / (df['monthly_income'] + 1)

        feature_cols = [
            'loan_amnt', 'annual_inc', 'monthly_income', 'emp_length_years',
            'home_ownership_numeric', 'grade_numeric', 'int_rate', 'dti',
            'fico_score', 'installment', 'verification_numeric', 'fixed_deposit',
            'fd_to_loan_ratio', 'installment_to_inc'
        ]

        X = df[feature_cols]
        y = df['approved']

        print(f"Dataset Shape: {X.shape[0]} samples x {len(feature_cols)} features")
        print(f"Target Distribution: Approved={sum(y==1)}, Rejected={sum(y==0)}")

        from sklearn.model_selection import train_test_split
        from sklearn.preprocessing import StandardScaler
        from sklearn.calibration import CalibratedClassifierCV
        from sklearn.pipeline import Pipeline
        from sklearn.metrics import accuracy_score, roc_auc_score, log_loss
        import xgboost as xgb

        # 80/20 Train-Validation Split
        X_train, X_val, y_train, y_val = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_val_scaled = scaler.transform(X_val)

        print("\n" + "-" * 75)
        print("⚡ TRAINING REGULARIZED XGBOOST (150 Boosting Iterations / Epochs)...")
        print("-" * 75)

        class DetailedEpochLogger(xgb.callback.TrainingCallback):
            def __init__(self, X_train, y_train, X_val, y_val, print_every=10):
                self.dtrain = xgb.DMatrix(X_train)
                self.dval = xgb.DMatrix(X_val)
                self.y_train = np.array(y_train)
                self.y_val = np.array(y_val)
                self.print_every = print_every
                print(f"{'Epoch/Round':<15} | {'Train Loss':<12} | {'Val Loss':<12} | {'Val Accuracy':<14} | {'Val ROC-AUC':<12}")
                print("-" * 75)

            def after_iteration(self, model, epoch, evals_log):
                if (epoch + 1) == 1 or (epoch + 1) % self.print_every == 0 or (epoch + 1) == 150:
                    train_probs = model.predict(self.dtrain)
                    val_probs = model.predict(self.dval)
                    val_preds = (val_probs >= 0.5).astype(int)

                    tr_loss = log_loss(self.y_train, train_probs)
                    v_loss = log_loss(self.y_val, val_probs)
                    v_acc = accuracy_score(self.y_val, val_preds) * 100
                    v_auc = roc_auc_score(self.y_val, val_probs)

                    print(f"Round [{epoch+1:03d}/150]    | {tr_loss:<12.4f} | {v_loss:<12.4f} | {v_acc:<13.2f}% | {v_auc:<12.4f}")
                return False

        # Regularized XGBoost configuration
        raw_xgb = xgb.XGBClassifier(
            n_estimators=150,
            max_depth=4,           # Constrained depth to prevent extreme leaf node outputs
            learning_rate=0.03,    # Smooth learning rate
            reg_lambda=5.0,        # L2 regularization penalty
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            eval_metric='logloss',
            callbacks=[DetailedEpochLogger(X_train_scaled, y_train, X_val_scaled, y_val, print_every=10)]
        )

        raw_xgb.fit(X_train_scaled, y_train)
        raw_xgb.callbacks = []
        if hasattr(raw_xgb, '_callbacks'):
            raw_xgb._callbacks = []

        print("\n" + "-" * 75)
        print("🎯 CALIBRATING PROBABILITY OUTPUTS (CalibratedClassifierCV)...")
        print("-" * 75)

        # Wrap in 5-fold cross-validation probability calibration
        calibrated_xgb = CalibratedClassifierCV(estimator=raw_xgb, method='sigmoid', cv=5)
        calibrated_xgb.fit(X_train_scaled, y_train)

        # Build combined sklearn pipeline
        pipeline = Pipeline([
            ('scaler', scaler),
            ('classifier', calibrated_xgb)
        ])

        final_preds = pipeline.predict(X_val)
        final_probs = pipeline.predict_proba(X_val)[:, 1]
        final_acc = accuracy_score(y_val, final_preds) * 100
        final_auc = roc_auc_score(y_val, final_probs)

        print("-" * 75)
        print("🎉 REGULARIZED & CALIBRATED XGBOOST TRAINING COMPLETE!")
        print(f"   Validation Accuracy: {final_acc:.2f}%")
        print(f"   Validation ROC-AUC:  {final_auc:.4f}")
        print(f"   Training Log File:   '{log_path}'")
        print("=" * 75)

        # Save model pickle
        os.makedirs(os.path.dirname(output_model_path), exist_ok=True)
        with open(output_model_path, 'wb') as f:
            pickle.dump({
                "pipeline": pipeline,
                "feature_names": feature_cols,
                "grade_map": grade_map,
                "home_map": home_map
            }, f)

        print(f"✅ Calibrated pipeline saved to '{output_model_path}'")
        return True

    except Exception as e:
        print(f"Error during training: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        sys.stdout = original_stdout

if __name__ == "__main__":
    train_lendingclub_model()
