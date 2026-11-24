#!/usr/bin/env python
"""
Script to fix the Charlson column name issue in 02_treino.ipynb and retrain the model.
"""
import json
import subprocess
import sys
from pathlib import Path

# Get the ml directory
ml_dir = Path(__file__).parent
notebooks_dir = ml_dir / 'notebooks'

# Load the notebook
notebook_path = notebooks_dir / '02_treino.ipynb'
with open(notebook_path, 'r', encoding='utf-8') as f:
    notebook = json.load(f)

# Fix cell 8 (PATIENTS FEATURES) - change 'charlson_comorbidity_index' to 'baseline_charlson_comorbidity_index'
for cell in notebook['cells']:
    if cell['cell_type'] == 'code':
        source = ''.join(cell['source'])
        if '# --- PATIENTS FEATURES ---' in source:
            # Fix the patient_features list
            new_source = source.replace(
                "'charlson_comorbidity_index',",
                "'baseline_charlson_comorbidity_index',"
            )
            cell['source'] = new_source.splitlines(keepends=True)
            print("Fixed cell 8: PATIENTS FEATURES")
            break

# Fix cell 13 (numeric_features classification) - change 'charlson_comorbidity_index' to 'baseline_charlson_comorbidity_index'
for cell in notebook['cells']:
    if cell['cell_type'] == 'code':
        source = ''.join(cell['source'])
        if '# Heurística: poucas categorias únicas' in source:
            new_source = source.replace(
                "'charlson_comorbidity_index',",
                "'baseline_charlson_comorbidity_index',"
            )
            cell['source'] = new_source.splitlines(keepends=True)
            print("Fixed cell 13: numeric_features classification")
            break

# Save the fixed notebook
with open(notebook_path, 'w', encoding='utf-8') as f:
    json.dump(notebook, f, ensure_ascii=False, indent=1)

print("Notebook fixed. Now executing...")

# Execute the notebook from the notebooks directory
result = subprocess.run([
    sys.executable, '-m', 'jupyter', 'nbconvert',
    '--to', 'notebook',
    '--execute', '02_treino.ipynb',
    '--output', '02_treino_executed.ipynb'
], capture_output=True, text=True, cwd=notebooks_dir)

print("STDOUT:", result.stdout)
if result.stderr:
    print("STDERR:", result.stderr)

if result.returncode == 0:
    print("\nNotebook executed successfully!")
else:
    print(f"\nNotebook execution failed with return code {result.returncode}")
    sys.exit(1)