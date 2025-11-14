from flask import Flask, render_template, request, redirect, url_for
import json
import os
import sys
import traceback

app = Flask(__name__)

# Add comprehensive error logging
@app.errorhandler(Exception)
def handle_exception(e):
    print("=== UNHANDLED EXCEPTION ===", file=sys.stderr)
    print(f"Error: {str(e)}", file=sys.stderr)
    print(f"Type: {type(e).__name__}", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)
    return f"Internal Server Error: {str(e)}", 500

LANGUAGES = [
    'Arabic', 'Chinese', 'English', 'German',
    'Japanese', 'Korean', 'Russian',
    'Spanish', 'Thai', 'Vietnamese'
]

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

@app.route('/')
def index():
    """Main landing page"""
    try:
        print(f"Rendering index.html with languages: {len(LANGUAGES)} languages", file=sys.stderr)
        return render_template('index.html', languages=LANGUAGES)
    except Exception as e:
        print(f"ERROR in index(): {str(e)}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        return f"Error: {str(e)}<br><pre>{traceback.format_exc()}</pre>", 500

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

    return redirect(url_for('annotate_task',
                           task_type=task_type,
                           language=language,
                           annotator_id=annotator_id))

# Health check route for debugging
@app.route('/health')
def health_check():
    """Health check endpoint"""
    try:
        return {
            'status': 'healthy',
            'templates': os.path.exists('templates'),
            'static': os.path.exists('static'),
            'cwd': os.getcwd(),
            'python_version': sys.version
        }
    except Exception as e:
        return {'status': 'error', 'message': str(e)}, 500

@app.route('/debug')
def debug_page():
    """Debug page to test basic rendering"""
    try:
        return render_template('index.html', languages=LANGUAGES)
    except Exception as e:
        return f"Error rendering template: {str(e)}<br><pre>{traceback.format_exc()}</pre>", 500

@app.route('/annotate/<task_type>/<language>')
def annotate_task(task_type, language):
    """Annotation interface"""
    annotator_id = request.args.get('annotator_id')
    example_idx = request.args.get('example_idx', 0, type=int)

    examples = load_examples(task_type, language)

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
                             progress={})
    else:
        return render_template('writing.html',
                             example=current_example,
                             example_idx=example_idx,
                             total_examples=len(examples),
                             annotator_id=annotator_id,
                             task_type=task_type,
                             language=language,
                             progress={})

# Vercel serverless handler
handler = app

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
