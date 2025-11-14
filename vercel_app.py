#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Vercel compatibility wrapper for Flask app
Ensures proper error handling and debugging in serverless environment
"""
import sys
import os
import traceback

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print(f"=== Starting Vercel Application ===", file=sys.stderr)
    print(f"Python: {sys.version}", file=sys.stderr)
    print(f"Working directory: {os.getcwd()}", file=sys.stderr)
    print(f"Files in current dir: {os.listdir('.')[:10]}", file=sys.stderr)

    # Import the app
    from app import app

    print("✓ Flask app imported successfully", file=sys.stderr)

    # Create handler for Vercel
    handler = app

    print("✓ Vercel handler created", file=sys.stderr)
    print("=== Application Ready ===", file=sys.stderr)

except Exception as e:
    print(f"=== FATAL ERROR DURING IMPORT ===", file=sys.stderr)
    print(f"Error: {str(e)}", file=sys.stderr)
    print(f"Type: {type(e).__name__}", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)

    # Create a fallback app
    from flask import Flask, jsonify
    app = Flask(__name__)

    @app.route('/')
    def error_page():
        error_info = {
            'error': str(e),
            'type': type(e).__name__,
            'traceback': traceback.format_exc()
        }
        return jsonify(error_info), 500

    handler = app
