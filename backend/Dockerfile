FROM python:3.11-slim

WORKDIR /app

# Install system deps for PaddleOCR / pypdf
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./

# Train the model into the image.
#
# The trained artifact is gitignored by design, so a deployed container would
# otherwise find no model and silently serve the rule-based heuristic instead
# of ML predictions. The dataset is committed, and training is deterministic
# and takes a few seconds, so it runs here and the model ships in the image.
COPY model_training/ ./model_training/
RUN python model_training/train.py \
    && cp model_training/loan_model.pkl ml/loan_approval_model.pkl \
    && python -c "import os; assert os.path.getsize('ml/loan_approval_model.pkl') > 0, 'model is empty'" \
    && rm -rf model_training

EXPOSE 8000

# Honour $PORT when the platform injects one (Render/Cloud Run); default to 8000 locally.
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}"]
