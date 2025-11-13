from flask import Flask, render_template, request, jsonify, redirect, url_for
import json
import os
import random
from datetime import datetime
import glob

app = Flask(__name__)

LANGUAGES = [
    'Arabic', 'Chinese', 'English', 'German',
    'Japanese', 'Korean', 'Russian',
    'Spanish', 'Thai', 'Vietnamese'
]

# Detect if running on Vercel
IS_VERCEL = os.environ.get('VERCEL', '').lower() == '1'

# Use /tmp directory on Vercel (read-only file system except /tmp)
# Use local outputs directory for local development
if IS_VERCEL:
    OUTPUT_DIR = '/tmp/outputs'
    print("Running on Vercel - using /tmp directory for file operations")
else:
    OUTPUT_DIR = 'outputs'
    print("Running locally - using local outputs directory")

AUTOSAVE_DIR = os.path.join(OUTPUT_DIR, 'autosave')
JUDGMENT_DIR = os.path.join(OUTPUT_DIR, 'judgment')
WRITING_DIR = os.path.join(OUTPUT_DIR, 'writing')

try:
    os.makedirs(AUTOSAVE_DIR, exist_ok=True)
    os.makedirs(JUDGMENT_DIR, exist_ok=True)
    os.makedirs(WRITING_DIR, exist_ok=True)

    for lang in LANGUAGES:
        os.makedirs(os.path.join(JUDGMENT_DIR, lang), exist_ok=True)
        os.makedirs(os.path.join(WRITING_DIR, lang), exist_ok=True)
    print(f"Directories created successfully in {OUTPUT_DIR}")
except OSError as e:
    print(f"Warning: Could not create directories: {e}")
    print("File operations may fail, but the app will continue to run.")

def load_examples(task_type, language):
    """Load examples from JSON file"""
    if task_type == 'judgment':
        file_path = f'completion_judgment/{language}_carb_samples.json'
    else:
        file_path = f'completion_writing/{language}_carb_samples.json'

    if not os.path.exists(file_path):
        return []

    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_progress(annotator_id, task_type, language):
    """Load previously saved progress"""
    autosave_file = os.path.join(AUTOSAVE_DIR, f'{annotator_id}_{task_type}_{language}.json')

    if os.path.exists(autosave_file):
        try:
            with open(autosave_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_progress(annotator_id, task_type, language, progress_data):
    """Auto-save progress - merges with existing data to avoid overwriting"""
    try:
        autosave_file = os.path.join(AUTOSAVE_DIR, f'{annotator_id}_{task_type}_{language}.json')

        # Load existing progress
        existing_data = {}
        if os.path.exists(autosave_file):
            try:
                with open(autosave_file, 'r', encoding='utf-8') as f:
                    existing_data = json.load(f)
            except:
                existing_data = {}

        # Merge new data with existing data
        # This ensures we don't overwrite previous examples
        merged_data = {**existing_data, **progress_data}

        with open(autosave_file, 'w', encoding='utf-8') as f:
            json.dump(merged_data, f, ensure_ascii=False, indent=2)

        return True
    except OSError as e:
        print(f"Warning: Could not save progress to {autosave_file}: {e}")
        return False

def save_batch(annotator_id, task_type, language, annotations):
    """Save completed batch"""
    try:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

        if task_type == 'judgment':
            output_file = os.path.join(JUDGMENT_DIR, language, f'{annotator_id}_{timestamp}.json')
        else:
            output_file = os.path.join(WRITING_DIR, language, f'{annotator_id}_{timestamp}.json')

        # Ensure the language subdirectory exists
        os.makedirs(os.path.dirname(output_file), exist_ok=True)

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(annotations, f, ensure_ascii=False, indent=2)

        return output_file
    except OSError as e:
        print(f"Warning: Could not save batch to {output_file}: {e}")
        return None

@app.route('/')
def index():
    """Main landing page"""
    return render_template('index.html', languages=LANGUAGES)

@app.route('/annotate', methods=['POST'])
def start_annotation():
    """Start annotation session"""
    annotator_id = request.form.get('annotator_id', '').strip()
    task_type = request.form.get('task_type')
    language = request.form.get('language')

    if not annotator_id:
        return render_template('index.html', languages=LANGUAGES,
                               error='Please enter your annotator ID')

    if not task_type or not language:
        return render_template('index.html', languages=LANGUAGES,
                               error='Please select both task type and language')

    examples = load_examples(task_type, language)
    if not examples:
        return render_template('index.html', languages=LANGUAGES,
                               error=f'No examples found for {language} in {task_type} task')

    progress = load_progress(annotator_id, task_type, language)

    return redirect(url_for('annotate_task',
                           task_type=task_type,
                           language=language,
                           annotator_id=annotator_id))

@app.route('/annotate/<task_type>/<language>')
def annotate_task(task_type, language):
    """Annotation interface"""
    annotator_id = request.args.get('annotator_id')
    example_idx = request.args.get('example_idx', 0, type=int)

    examples = load_examples(task_type, language)
    progress = load_progress(annotator_id, task_type, language)

    if example_idx >= len(examples):
        example_idx = 0

    current_example = examples[example_idx]

    if task_type == 'judgment':
        return render_template('judgment.html',
                             example=current_example,
                             example_idx=example_idx,
                             total_examples=len(examples),
                             annotator_id=annotator_id,
                             task_type=task_type,
                             language=language,
                             progress=progress)
    else:
        return render_template('writing.html',
                             example=current_example,
                             example_idx=example_idx,
                             total_examples=len(examples),
                             annotator_id=annotator_id,
                             task_type=task_type,
                             language=language,
                             progress=progress)

@app.route('/api/save_progress', methods=['POST'])
def api_save_progress():
    """API endpoint for auto-saving"""
    data = request.json

    annotator_id = data.get('annotator_id')
    task_type = data.get('task_type')
    language = data.get('language')
    annotations = data.get('annotations', {})

    success = save_progress(annotator_id, task_type, language, annotations)

    if success:
        return jsonify({'status': 'success'})
    else:
        return jsonify({'status': 'error', 'message': 'Failed to save progress'}), 500

@app.route('/api/submit_batch', methods=['POST'])
def api_submit_batch():
    """API endpoint for submitting batch"""
    data = request.json

    annotator_id = data.get('annotator_id')
    task_type = data.get('task_type')
    language = data.get('language')
    annotations = data.get('annotations', {})

    output_file = save_batch(annotator_id, task_type, language, annotations)

    # Handle failed save
    if output_file is None:
        return jsonify({
            'status': 'error',
            'message': 'Failed to save batch. File system may be read-only.'
        }), 500

    # Clean up autosave file
    try:
        autosave_file = os.path.join(AUTOSAVE_DIR, f'{annotator_id}_{task_type}_{language}.json')
        if os.path.exists(autosave_file):
            os.remove(autosave_file)
    except OSError as e:
        print(f"Warning: Could not remove autosave file: {e}")

    return jsonify({
        'status': 'success',
        'output_file': output_file,
        'annotations_count': len(annotations)
    })

@app.route('/api/download_annotations', methods=['POST'])
def api_download_annotations():
    """API endpoint for downloading annotations as a file"""
    data = request.json

    annotator_id = data.get('annotator_id')
    task_type = data.get('task_type')
    language = data.get('language')
    annotations = data.get('annotations', {})

    if not annotator_id or not task_type or not language:
        return jsonify({'status': 'error', 'message': 'Missing required parameters'}), 400

    # Create the annotation data structure
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    annotation_data = {
        'annotator_id': annotator_id,
        'task_type': task_type,
        'language': language,
        'timestamp': timestamp,
        'annotations': annotations,
        'annotations_count': len(annotations)
    }

    return jsonify({
        'status': 'success',
        'data': annotation_data,
        'filename': f'{annotator_id}_{task_type}_{language}_{timestamp}.json'
    })

# Vercel serverless handler
handler = app

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
