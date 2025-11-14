// ============================================================================
// Utility functions for static frontend
// ============================================================================

// Global configuration
const CONFIG = {
    LANGUAGES: [
        'Arabic', 'Chinese', 'English', 'German',
        'Japanese', 'Korean', 'Russian',
        'Spanish', 'Thai', 'Vietnamese'
    ]
};

// URL Parameter handling
class URLParams {
    static get(name) {
        const url = new URL(window.location.href);
        return url.searchParams.get(name);
    }

    static set(name, value) {
        const url = new URL(window.location.href);
        url.searchParams.set(name, value);
        window.location.href = url.toString();
    }
}

// JSON Data loading
class DataLoader {
    static async loadExamples(taskType, language) {
        const filename = `${language}_carb_samples.json`;
        const path = taskType === 'judgment'
            ? `completion_judgment/${filename}`
            : `completion_writing/${filename}`;

        try {
            console.log(`Loading examples from: ${path}`);
            const response = await fetch(path);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✓ Loaded ${data.length} examples`);
            return data;
        } catch (error) {
            console.error(`✗ Failed to load examples:`, error);
            return [];
        }
    }

    static async loadExample(taskType, language, exampleIdx) {
        const examples = await this.loadExamples(taskType, language);

        if (!examples || examples.length === 0) {
            return null;
        }

        if (exampleIdx >= examples.length) {
            exampleIdx = 0;
        }

        return examples[exampleIdx];
    }
}

// LocalStorage helpers
class Storage {
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    }

    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }
}

// Navigation helpers
class Navigation {
    static async getCurrentExample(taskType, language) {
        const exampleIdx = parseInt(URLParams.get('example_idx') || '0');
        const example = await DataLoader.loadExample(taskType, language, exampleIdx);

        if (!example) {
            return null;
        }

        return {
            example: example,
            exampleIdx: exampleIdx,
            totalExamples: (await DataLoader.loadExamples(taskType, language)).length
        };
    }

    static nextExample() {
        const currentIdx = parseInt(URLParams.get('example_idx') || '0');
        URLParams.set('example_idx', currentIdx + 1);
    }

    static previousExample() {
        const currentIdx = parseInt(URLParams.get('example_idx') || '0');
        if (currentIdx > 0) {
            URLParams.set('example_idx', currentIdx - 1);
        }
    }

    static goToFirstExample() {
        URLParams.set('example_idx', '0');
    }
}

// Initialize app parameters from URL or localStorage
function initAppParams() {
    // Get from URL params first, then fall back to localStorage
    const annotatorId = URLParams.get('annotator_id') || Storage.get('annotatorId');
    const language = URLParams.get('language') || Storage.get('language');
    const taskType = getTaskTypeFromURL();

    if (!annotatorId || !language) {
        console.warn('Missing required parameters. Should redirect to index.');
        // Redirect to index if missing required params
        window.location.href = 'index_static.html';
        return null;
    }

    // Store in localStorage for future use
    if (annotatorId) Storage.set('annotatorId', annotatorId);
    if (language) Storage.set('language', language);

    const exampleIdx = parseInt(URLParams.get('example_idx') || '0');

    return {
        annotatorId: annotatorId,
        taskType: taskType,
        language: language,
        exampleIdx: exampleIdx
    };
}

function getTaskTypeFromURL() {
    const path = window.location.pathname;
    if (path.includes('judgment')) return 'judgment';
    if (path.includes('writing')) return 'writing';
    return null;
}

// Show loading spinner
function showLoading() {
    const html = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <h4 class="mt-3">Loading examples...</h4>
        </div>
    `;
    document.body.innerHTML = html;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { URLParams, DataLoader, Storage, Navigation, initAppParams };
}
