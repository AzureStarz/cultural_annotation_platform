# Cultural Alignment Annotation Platform - User Guide

## Overview

This is a **user-friendly web-based annotation platform** designed for people without technical or computer science backgrounds. The platform helps evaluate and improve AI's understanding of cultural commonsense across 10 languages.

## Quick Start (For Annotators)

### Step 1: Install and Run the Platform

1. **Install Python** (if you don't have it):
   - Visit https://www.python.org/downloads/
   - Download and install Python 3.8 or higher
   - On Windows: Make sure to check "Add Python to PATH" during installation

2. **Install the platform**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the platform**:
   ```bash
   python app.py
   ```

4. **Open your web browser** and go to:
   ```
   http://localhost:8080
   ```

### Step 2: Start Annotating

1. **Enter your Annotator ID**: Use any name you like (e.g., your name with a number)

2. **Choose your Task**:
   - **Judgment Task** - Judge whether AI completions are culturally correct
   - **Writing Task** - Write culturally-accurate completions yourself

3. **Select a Language**: Choose the language you're most comfortable with

4. **Click "Start Annotating"**

## Task Instructions

### Task 1: Judgment Task (For Non-Technical Users)

In this task, you'll see:
- A question or prompt about a specific culture
- One "chosen" completion (the AI's selected answer)
- Three "rejected" completions (alternative answers)

**For each completion, you need to answer:**

1. **Chosen Completion** (Green box):
   - ❓ Question: Does this correctly reflect the target culture?
   - ✅ Click YES if it's accurate
   - ❌ Click NO if it has errors or misunderstandings

2. **Rejected Completions** (Red boxes):
   - ❓ Question: Does this show cultural misunderstanding?
   - ✅ Click YES if there are cultural errors or stereotypes
   - ❌ Click NO if it seems accurate

**Additional Information (Required):**
- **Confidence Level**: How familiar are you with this culture?
  - Low: Not very familiar
  - Medium: Somewhat familiar
  - High: Very familiar or from this culture

- **Notes** (Optional): Add explanations or observations

- **Time** (Optional): How many minutes did you spend?

**When finished:**
- ✅ Your annotations are saved automatically on the server
- ✅ You'll be prompted to download a local copy to your computer
- ✅ The file is saved in your Downloads folder as a JSON file
- ✅ Keep your local copy as a backup!

### Task 2: Writing Task (For Non-Technical Users)

In this task, you'll:
1. Read a prompt about a specific culture
2. Look at a reference completion (for theme only - don't copy it!)
3. **Write your own culturally-accurate completion**

**Tips for Writing Good Completions:**
- ✅ Be specific with cultural details and examples
- ✅ Use your personal knowledge or experiences
- ✅ Address the same topic as the reference
- ✅ Write naturally, as if speaking to someone from that culture
- ✅ Avoid vague statements and stereotypes
- ✅ Include 2-5 sentences with real examples

**Additional Information:**
- **Notes** (Optional): Explain your reasoning or sources
- **Time** (Optional): Track how long you spent

## Platform Features

### Auto-Save (Every 30 seconds)
✅ Your work is automatically saved
✅ You can take breaks and come back anytime
✅ Progress is saved even if you close the browser

### Navigation
- ⏮️ **Previous**: Go back to review or change answers
- ⏭️ **Next**: Move to the next example (or submit when finished)

### Progress Tracking
📊 See your progress with the green progress bar at the top
📊 Know exactly how many examples you've completed

### Helpful Reminders
💡 Clear instructions on every page
💡 Examples for each task type
💡 Tooltips and help text throughout

## Important Notes

### System Requirements
- 💻 Desktop or laptop computer (recommended)
- 🌐 Stable internet connection
- 🌐 Modern web browser (Chrome, Firefox, Edge, or Safari)

### Best Practices
1. **Take your time** - There's no time limit
2. **Be honest** - It's okay to select "Low confidence" if unsure
3. **Use notes** - Explain your reasoning when helpful
4. **Ask questions** - Contact the project coordinator if unsure

### Troubleshooting

**Platform won't start:**
- Make sure Python is installed: `python --version`
- Make sure Flask is installed: `pip show flask`
- Check error messages carefully

**Can't access the website:**
- Make sure the server is running (you should see "Running on http://0.0.0.0:8080")
- Try refreshing your browser
- Check your internet connection

**Lost my progress:**
- The platform auto-saves every 30 seconds
- Check the `outputs/autosave/` folder for backup files
- Contact the project coordinator for help

## Output Files

Your work is saved in **two places** for safety:

### 1. Server-Saved Files (Automatic)
These files are saved automatically in the platform folder:
- **During annotation**: `outputs/autosave/` - Auto-saved progress every 30 seconds
- **Final results**: `outputs/judgment/{language}/` or `outputs/writing/{language}/`

Each file is named with your annotator ID and timestamp (e.g., `annotator_01_20251113_143022.json`)

### 2. Local Download Files (When You Finish)
When you complete your annotations and click "Submit":
- ✅ You'll see a **Download** button in the success message
- ✅ Click it to save a copy to your **Downloads folder**
- ✅ File format: `cultural_annotations_{your_id}_{date}.json` or `cultural_writing_{your_id}_{date}.json`
- ✅ This is your personal backup copy!

**Important:** Both files contain the same data. Keep your local copy as a backup.

## Getting Help

If you need assistance:
1. Check this README first
2. Read the ANNOTATION_GUIDELINES.md file
3. Ask the project coordinator

---

## For Technical Users (Developers)

### Running the Platform

```bash
# Install dependencies
pip install -r requirements.txt

# Run the Flask app
python app.py

# Access at http://localhost:8080
```

### Project Structure

```
├── app.py                          # Main Flask application
├── requirements.txt                # Python dependencies
├── templates/                      # HTML templates
│   ├── index.html                 # Landing page
│   ├── judgment.html              # Judgment task interface
│   └── writing.html               # Writing task interface
├── static/                        # CSS and JavaScript
│   ├── css/style.css             # Custom styling
│   └── js/                       # Task-specific JavaScript
│       ├── judgment.js           # Judgment functionality
│       └── writing.js            # Writing functionality
├── outputs/                       # Saved annotations
│   ├── autosave/                 # Auto-saved progress
│   ├── judgment/                 # Final judgment results
│   └── writing/                  # Final writing results
└── README.md                     # This file
```

### API Endpoints

- `POST /annotate` - Start annotation session
- `GET /annotate/<task_type>/<language>` - Annotation interface
- `POST /api/save_progress` - Auto-save progress
- `POST /api/submit_batch` - Submit completed batch

### Key Features

- ✅ Flask-based web application
- ✅ Auto-save every 30 seconds
- ✅ Responsive Bootstrap UI
- ✅ Progress tracking
- ✅ Multi-language support (10 languages)
- ✅ Batch submission with modal confirmation
- ✅ User-friendly error handling
- ✅ Persistent storage in JSON format

### Customization

To add new features:
1. Modify `app.py` for backend logic
2. Update templates for UI changes
3. Edit CSS/JS for styling and functionality
4. Add new routes as needed

---

**Thank you for contributing to culturally-aware AI research!**

For questions or feedback, please contact the project coordinator.
Last updated: 2025
