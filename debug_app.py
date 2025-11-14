#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
MINIMAL Vercel debug app
This should always work and show us what's wrong
"""
import sys
import os

print(f"=== DEBUG APP STARTING ===", file=sys.stderr)
print(f"Python version: {sys.version}", file=sys.stderr)
print(f"Working directory: {os.getcwd()}", file=sys.stderr)
print(f"Directory contents: {os.listdir('.')}", file=sys.stderr)
print(f"Python path: {sys.path}", file=sys.stderr)

try:
    # First, try to import flask
    print("\n1. Trying to import Flask...", file=sys.stderr)
    from flask import Flask, render_template_string
    print("✓ Flask imported successfully", file=sys.stderr)

    # Create basic app
    app = Flask(__name__)
    print("✓ Flask app created", file=sys.stderr)

    # Define a very simple route
    @app.route('/')
    def index():
        return f"""
        <h1>Debug Page - App Working!</h1>
        <h2>Environment Info</h2>
        <ul>
            <li><strong>Python Version:</strong> {sys.version}</li>
            <li><strong>Working Directory:</strong> {os.getcwd()}</li>
            <li><strong>Directory Contents:</strong> {os.listdir('.')}</li>
        </ul>
        <h2>Next Steps</h2>
        <p>If you see this page, the basic Flask setup is working!</p>
        <p>Now try accessing: <a href="/test-templates">Test Templates</a></p>
        <p>Then check: <a href="/test-json">Test JSON Loading</a></p>
        """

    @app.route('/test-templates')
    def test_templates():
        try:
            print("Trying to render template...", file=sys.stderr)
            # First check if templates directory exists
            if not os.path.exists('templates'):
                return f"Templates directory not found!<br>Contents: {os.listdir('.')}"

            print(f"Templates directory exists, contents: {os.listdir('templates')}", file=sys.stderr)

            # Check if index.html exists
            if not os.path.exists('templates/index.html'):
                return f"index.html not found!<br>Contents: {os.listdir('templates')}"

            print("index.html found, trying to render...", file=sys.stderr)
            return render_template('index.html')
        except Exception as e:
            error_msg = f"Template error: {str(e)}<br><pre>{traceback.format_exc()}</pre>"
            print(error_msg, file=sys.stderr)
            return error_msg, 500

    @app.route('/test-json')
    def test_json():
        try:
            # Test JSON loading
            import json
            files = ['completion_judgment', 'completion_writing']
            results = []
            for f in files:
                if os.path.exists(f):
                    json_files = [j for j in os.listdir(f) if j.endswith('.json')]
                    results.append(f"{f}: {json_files}")
                else:
                    results.append(f"{f}: directory not found")
            return "<br>".join(results)
        except Exception as e:
            return f"JSON test error: {str(e)}<br><pre>{traceback.format_exc()}</pre>"

    # Create handler
    handler = app
    print("✓ Handler created successfully", file=sys.stderr)
    print("=== DEBUG APP READY ===", file=sys.stderr)

except Exception as e:
    import traceback
    print(f"\n=== FATAL ERROR IN DEBUG APP ===", file=sys.stderr)
    print(f"Error: {str(e)}", file=sys.stderr)
    print(f"Type: {type(e).__name__}", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)

    # Create a minimal error app
    from flask import Flask
    app = Flask(__name__)

    @app.route('/')
    def error_page():
        return f"""
        <h1>Fatal Error!</h1>
        <p><strong>{type(e).__name__}:</strong> {str(e)}</p>
        <h2>Traceback:</h2>
        <pre>{traceback.format_exc()}</pre>
        <h2>Environment:</h2>
        <ul>
            <li>Python: {sys.version}</li>
            <li>Working dir: {os.getcwd()}</li>
            <li>Contents: {os.listdir('.')}</li>
        </ul>
        """

    handler = app
