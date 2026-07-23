# Model Training Suite

Dedicated standalone module for training, evaluating, and integrating Machine Learning models (XGBoost / Random Forest) for the Smart Loan Eligibility & Recommendation Engine.

---

## Folder Structure

```
model_training/
│
├── dataset.csv          # Training dataset with customer financial profiles
├── train.py            # Model training & hyperparameter tuning script
├── evaluate.py         # Model evaluation & accuracy metrics validator
├── integrate.py        # Integration tool to deploy trained model to backend/ml/
├── loan_model.pkl      # Output trained model file
└── README.md           # Documentation & instructions
```

---

## Quick Start Guide

### Step 1: Install Dependencies
```bash
py -m pip install pandas scikit-learn xgboost
```

### Step 2: Train Model
Train model on `dataset.csv`:
```bash
py model_training/train.py
```

### Step 3: Evaluate Model Performance
Test approval probability predictions & risk classification:
```bash
py model_training/evaluate.py
```

### Step 4: Deploy / Integrate with Backend
Copy trained `loan_model.pkl` directly to `backend/ml/`:
```bash
py model_training/integrate.py
```
