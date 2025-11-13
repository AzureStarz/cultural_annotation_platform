#!/usr/bin/env python3
"""
Quick Start Script for Cultural Alignment Annotation Platform
This script makes it super easy for non-technical users to start the platform.
"""

import subprocess
import sys
import os
import webbrowser
import time

def check_python():
    """Check if Python is installed"""
    try:
        result = subprocess.run([sys.executable, '--version'], capture_output=True, text=True)
        version = result.stdout.strip() or result.stderr.strip()
        print(f"✓ {version}")
        return True
    except Exception as e:
        print(f"✗ Python not found or error: {e}")
        return False

def install_requirements():
    """Install required packages"""
    print("\n📦 Installing required packages (this may take a few minutes)...")
    try:
        result = subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'],
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("✓ Packages installed successfully!")
            return True
        else:
            print(f"✗ Error installing packages: {result.stderr}")
            return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def start_server():
    """Start the Flask server"""
    print("\n🚀 Starting the annotation platform...")
    print("This will open in your web browser automatically.")
    print("\nTo stop the platform, press Ctrl+C in this window.\n")

    # Start the server
    try:
        # Give the server a moment to start before opening browser
        time.sleep(2)
        webbrowser.open('http://localhost:8080')

        # Run the Flask app
        subprocess.run([sys.executable, 'app.py'], check=True)
    except KeyboardInterrupt:
        print("\n\n👋 Platform stopped. Goodbye!")
    except Exception as e:
        print(f"\n✗ Error starting platform: {e}")
        print("\nTry running manually with: python app.py")

def main():
    """Main function to guide the user"""
    print("=" * 60)
    print("🌍 Cultural Alignment Annotation Platform")
    print("=" * 60)
    print("\nThis script will help you start the annotation platform.")
    print("\nChecking system requirements...")

    # Check Python
    if not check_python():
        print("\n❌ Python is not installed or not in PATH.")
        print("\nPlease install Python 3.8 or higher from:")
        print("   https://www.python.org/downloads/")
        print("\nThen run this script again.")
        sys.exit(1)

    # Check if requirements are installed
    print("\n🔍 Checking if required packages are installed...")
    try:
        import flask
        print("✓ Flask is already installed!")
    except ImportError:
        print("Flask not found. Installing...")
        if not install_requirements():
            print("\n❌ Failed to install packages. Please install manually:")
            print("   pip install -r requirements.txt")
            sys.exit(1)

    # Start the platform
    start_server()

if __name__ == "__main__":
    main()
