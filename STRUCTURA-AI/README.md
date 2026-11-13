# STRUCTURA-AI — work in progress

An early research prototype for visual concrete inspection. It is not a structural safety assessment and does not replace an engineer. **No useful model, defect prediction or integrated fuzzy assessment is currently available.** A basic PDF exports the image and image properties only; it is not an inspection assessment. Thresholds and contours show generic image regions only. An illustrative, unvalidated rule-based fuzzy engine is present for testing but is not connected to the dashboard and is not a trained neuro-fuzzy network.

## Setup (Windows PowerShell)

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python download_datasets.py
python prepare_dataset.py
python -m deep_learning.train --epochs 10
python -m deep_learning.evaluate
python -m streamlit run app.py
python -m pytest -q
```

The downloader retrieves the official NCCD-PF archive and checks its published MD5. It can resume a partial download when supported by the server. See `documentation/dataset_documentation.md` for sources, scope and attribution. The preparation script produces exploratory splits that group exact duplicates; source-structure and near-duplicate leakage remain possible. Training is configurable but the architecture is not integrated into the app. An initial one-epoch CPU experiment predicted no cracks at the evaluation threshold; see `documentation/experiment_log.md`. A useful trained model, reliable independent evaluation, fuzzy integration, reports, and academic deliverables remain to be completed. Do not use this prototype to make inspection decisions.
