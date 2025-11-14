// ============================================================================
// Cultural Annotation Platform - Judgment Task
// ============================================================================
// Storage System: Browser LocalStorage
// Environment: Vercel Static Hosting (No Python backend)
//
// Data Flow:
// 1. Annotations stored in browser's LocalStorage (no server needed)
// 2. All operations happen client-side
// 3. Download button exports all annotations as JSON file
// ============================================================================

// Global variables (initialized after DOM load)
let annotatorId = null;
let taskType = null;
let language = null;
let exampleId = null;
let exampleIdx = 0;
let totalExamples = 0;
let currentExample = null;

// Global annotation data storage (in-memory cache)
const annotations = {};      // Current example's annotations
let currentConfidence = null; // Current confidence level
let startTime = Date.now();   // Start time for tracking
let storage = null;           // Storage instance

// ============================================================================
// STORAGE MANAGEMENT - LocalStorage based
// ============================================================================

class AnnotationStorage {
    constructor(annotatorId, taskType, language) {
        this.annotatorId = annotatorId;
        this.taskType = taskType;
        this.language = language;
        this.storageKey = `cultural_annotations_${annotatorId}_${taskType}_${language}`;
    }

    // Load all annotations from LocalStorage
    loadAll() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading from LocalStorage:', error);
        }
        return {};
    }

    // Save all annotations to LocalStorage
    saveAll(annotations) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(annotations));
            console.log(`✓ Saved ${Object.keys(annotations).length} annotations to LocalStorage`);
            return true;
        } catch (error) {
            console.error('Error saving to LocalStorage:', error);
            alert('Error saving annotations: ' + error.message);
            return false;
        }
    }

    // Save single annotation
    save(exampleId, annotationData) {
        const allAnnotations = this.loadAll();
        allAnnotations[exampleId] = {
            ...annotationData,
            last_modified: new Date().toISOString()
        };
        return this.saveAll(allAnnotations);
    }

    // Load single annotation
    load(exampleId) {
        const allAnnotations = this.loadAll();
        return allAnnotations[exampleId];
    }

    // Get statistics
    getStats() {
        const allAnnotations = this.loadAll();
        return {
            total: Object.keys(allAnnotations).length,
            data: allAnnotations
        };
    }

    // Clear all annotations
    clear() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('Cleared all annotations from LocalStorage');
            return true;
        } catch (error) {
            console.error('Error clearing LocalStorage:', error);
            return false;
        }
    }

    // Export data for download
    exportForDownload() {
        const allAnnotations = this.loadAll();
        const timestamp = new Date().toISOString().slice(0, 10);

        return {
            filename: `cultural_annotations_${this.annotatorId}_${this.taskType}_${this.language}_${timestamp}.json`,
            data: {
                annotator_id: this.annotatorId,
                task_type: this.taskType,
                language: this.language,
                export_timestamp: new Date().toISOString(),
                total_annotations: Object.keys(allAnnotations).length,
                annotations: allAnnotations,
                metadata: {
                    storage_type: 'browser_localstorage',
                    note: 'All data stored in browser. Make sure to back up this file!'
                }
            }
        };
    }
}

// Create global storage instance (will be initialized with user parameters)
let storage = null;

// ============================================================================
// ANNOTATION LOGIC
// ============================================================================

function selectJudgment(field, value) {
    annotations[field] = value;

    // Generate button IDs from field name
    // 'chosen_alignment' -> 'chosen_yes/no'
    // 'rejected_misalignment_0' -> 'rejected_0_yes/no'
    let baseId;
    if (field === 'chosen_alignment') {
        baseId = 'chosen';
    } else if (field.startsWith('rejected_misalignment_')) {
        baseId = field.replace('_misalignment', '');
    } else {
        console.error('Unknown field:', field);
        return;
    }

    const yesBtn = document.getElementById(baseId + '_yes');
    const noBtn = document.getElementById(baseId + '_no');

    if (!yesBtn || !noBtn) {
        console.error('Buttons not found for field:', field, 'baseId:', baseId);
        return;
    }

    yesBtn.classList.remove('active');
    noBtn.classList.remove('active');

    // Add click animation
    yesBtn.classList.remove('clicked');
    noBtn.classList.remove('clicked');

    if (value === true) {
        yesBtn.classList.add('active', 'clicked');
    } else {
        noBtn.classList.add('active', 'clicked');
    }

    setTimeout(() => {
        yesBtn.classList.remove('clicked');
        noBtn.classList.remove('clicked');
    }, 500);

    updateAnsweredIndicators();
    updateNextButton();
}

function selectConfidence(level) {
    currentConfidence = level;

    document.querySelectorAll('.confidence-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById('conf_' + level).classList.add('active');
    updateNextButton();
}

function updateAnsweredIndicators() {
    const fields = [
        'chosen_alignment',
        'rejected_misalignment_0',
        'rejected_misalignment_1',
        'rejected_misalignment_2'
    ];

    fields.forEach(field => {
        const container = document.getElementById(field + '_container');
        if (container) {
            if (annotations[field] !== undefined) {
                container.classList.add('answered');
            } else {
                container.classList.remove('answered');
            }
        }
    });
}

function isCurrentExampleComplete() {
    return annotations.chosen_alignment !== undefined &&
           annotations.rejected_misalignment_0 !== undefined &&
           annotations.rejected_misalignment_1 !== undefined &&
           annotations.rejected_misalignment_2 !== undefined &&
           currentConfidence !== null;
}

function updateNextButton() {
    const nextBtn = document.getElementById('nextBtn');
    const nextBtnText = document.getElementById('nextBtnText');

    if (!nextBtn || !nextBtnText) return;

    if (isCurrentExampleComplete()) {
        nextBtn.classList.remove('btn-outline-secondary', 'btn-warning');
        nextBtn.classList.add('btn-success');
        nextBtn.disabled = false;

        if (exampleIdx + 1 < totalExamples) {
            nextBtnText.textContent = 'Next Example';
        } else {
            nextBtnText.textContent = 'Submit All Annotations';
        }
    } else {
        nextBtn.classList.remove('btn-success');
        nextBtn.classList.add('btn-outline-secondary');
        nextBtn.disabled = false;

        if (exampleIdx + 1 < totalExamples) {
            nextBtnText.textContent = 'Complete Required Fields to Continue';
        } else {
            nextBtnText.textContent = 'Complete All Fields to Submit';
        }
    }
}

// ============================================================================
// NAVIGATION & SAVING
// ============================================================================

function saveCurrentToStorage() {
    if (!storage || !exampleId) return false;

    const notes = document.getElementById('notes').value;
    const timeMinutes = document.getElementById('time_minutes').value;
    const annotationTimeSeconds = timeMinutes ? parseInt(timeMinutes) * 60 : 0;

    const currentData = {
        ...annotations,
        confidence: currentConfidence,
        notes: notes,
        annotation_time_seconds: annotationTimeSeconds || 0,
        timestamp: new Date().toISOString(),
        example_id: exampleId,
        example_idx: exampleIdx
    };

    return storage.save(exampleId, currentData);
}

function previousExample() {
    if (exampleIdx > 0) {
        saveCurrentToStorage();
        const url = new URL(window.location);
        url.searchParams.set('example_idx', exampleIdx - 1);
        window.location.href = url.toString();
    }
}

function nextExample() {
    if (!isCurrentExampleComplete()) {
        showIncompleteWarning();
        return;
    }

    saveCurrentToStorage();

    if (exampleIdx + 1 < totalExamples) {
        const url = new URL(window.location);
        url.searchParams.set('example_idx', exampleIdx + 1);
        window.location.href = url.toString();
    } else {
        showCompletionMessage();
    }
}

// ============================================================================
// DOWNLOAD FUNCTIONALITY
// ============================================================================

function downloadFile(data, filename) {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(dataBlob);
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);

    setTimeout(() => {
        link.click();

        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    }, 10);

    showDownloadConfirmation(filename);
}

function handleDownloadClick() {
    if (!storage) {
        alert('Error: Storage not initialized');
        return;
    }

    console.log('=== PREPARING DOWNLOAD ===');

    const downloadBtn = document.getElementById('downloadBtn');
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Preparing...';

    saveCurrentToStorage();

    const exportData = storage.exportForDownload();

    console.log('Annotations to download:', exportData.data);
    console.log('Filename:', exportData.filename);

    downloadFile(exportData.data, exportData.filename);

    downloadBtn.disabled = false;
    downloadBtn.innerHTML = '<i class="fas fa-download me-1"></i> Download';

    console.log('=== DOWNLOAD COMPLETE ===');
}

function showDownloadConfirmation(filename) {
    const alertHtml = `
        <div class="alert alert-success alert-dismissible fade show position-fixed"
             style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;"
             id="downloadAlert">
            <i class="fas fa-download me-2"></i>
            <strong>File downloaded!</strong><br>
            <small>Saved as: ${filename}</small>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', alertHtml);

    setTimeout(() => {
        const alert = document.getElementById('downloadAlert');
        if (alert) alert.remove();
    }, 5000);
}

// ============================================================================
// MODALS & MESSAGES
// ============================================================================

function showIncompleteWarning() {
    const missingFields = [];

    if (annotations.chosen_alignment === undefined) missingFields.push("Chosen Completion judgment");
    if (annotations.rejected_misalignment_0 === undefined) missingFields.push("Rejected #1 judgment");
    if (annotations.rejected_misalignment_1 === undefined) missingFields.push("Rejected #2 judgment");
    if (annotations.rejected_misalignment_2 === undefined) missingFields.push("Rejected #3 judgment");
    if (currentConfidence === null) missingFields.push("Confidence level");

    const modalHtml = `
        <div class="modal fade" id="incompleteModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-warning text-dark">
                        <h3 class="modal-title">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Complete Required Fields
                        </h3>
                    </div>
                    <div class="modal-body py-4">
                        <div class="text-center mb-3">
                            <i class="fas fa-tasks fs-1 text-warning mb-3"></i>
                            <h4>Please complete all required fields</h4>
                            <p class="text-muted">You must answer all questions before continuing.</p>
                        </div>
                        <div class="alert alert-light border">
                            <h6 class="alert-heading">Missing fields:</h6>
                            <pre class="mb-0 text-danger" style="white-space: pre-wrap; font-size: 0.9rem;">${missingFields.map(f => `• ${f}`).join('\n')}</pre>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-warning btn-lg w-100" data-bs-dismiss="modal">
                            <i class="fas fa-edit me-1"></i>
                            Go Back and Complete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const existingModal = document.getElementById('incompleteModal');
    if (existingModal) existingModal.remove();

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('incompleteModal'));
    modal.show();
}

function showCompletionMessage() {
    const stats = storage ? storage.getStats() : { total: 0, data: {} };

    const modalHtml = `
        <div class="modal fade" id="completionModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h3 class="modal-title">
                            <i class="fas fa-check-circle me-2"></i>
                            All Annotations Complete!
                        </h3>
                    </div>
                    <div class="modal-body">
                        <p class="lead">
                            <strong>Great job!</strong> You have completed all ${totalExamples} examples.
                        </p>
                        <p>
                            <i class="fas fa-info-circle text-info me-2"></i>
                            <strong>Next steps:</strong> Click the <span class="badge bg-info text-white">
                            <i class="fas fa-download me-1"></i>Download</span> button to save your work.
                        </p>
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            <strong>Important:</strong> Your annotations are stored in browser memory.
                            Download the file to keep a permanent record!
                        </div>
                        <p class="mb-0">
                            <i class="fas fa-save text-success me-2"></i>
                            You have annotated ${stats.total} examples in total (including this session).
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-success" data-bs-dismiss="modal">
                            <i class="fas fa-check me-1"></i>
                            Got it!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('completionModal'));
    modal.show();
}

// ============================================================================
// INITIALIZATION
// ============================================================================

async function initializeApp() {
    console.log('=== Initializing Cultural Annotation App (Static) ===');

    try {
        // Get parameters from URL
        const params = {
            annotatorId: URLParams.get('annotator_id'),
            language: URLParams.get('language'),
            taskType: getTaskTypeFromURL(),
            exampleIdx: parseInt(URLParams.get('example_idx') || '0')
        };

        if (!params.annotatorId || !params.language) {
            console.error('Missing required parameters:', params);
            alert('Missing required parameters. Redirecting to home page.');
            window.location.href = 'index_static.html';
            return;
        }

        // Set global variables
        annotatorId = params.annotatorId;
        language = params.language;
        taskType = params.taskType;
        exampleIdx = params.exampleIdx;

        console.log('Parameters loaded:', { annotatorId, language, taskType, exampleIdx });

        // Load current example
        currentExample = await DataLoader.loadExample(taskType, language, exampleIdx);
        if (!currentExample) {
            alert('Failed to load examples. Please check your data files.');
            window.location.href = 'index_static.html';
            return;
        }

        exampleId = currentExample.id;
        const examples = await DataLoader.loadExamples(taskType, language);
        totalExamples = examples.length;

        console.log(`Loaded example ${exampleIdx + 1}/${totalExamples}:`, currentExample.id);

        // Render the page content
        await renderPageContent();

        // Initialize storage
        storage = new AnnotationStorage(annotatorId, taskType, language);

        // Load saved progress for current example
        const savedData = storage.load(exampleId);
        if (savedData) {
            console.log('Found saved data for this example:', savedData);

            // Restore annotations
            if (savedData.chosen_alignment !== undefined) {
                selectJudgment('chosen_alignment', savedData.chosen_alignment);
            }
            for (let i = 0; i < 3; i++) {
                if (savedData[`rejected_misalignment_${i}`] !== undefined) {
                    selectJudgment(`rejected_misalignment_${i}`, savedData[`rejected_misalignment_${i}`]);
                }
            }

            // Restore confidence
            if (savedData.confidence) {
                selectConfidence(savedData.confidence);
            }

            // Restore notes
            if (savedData.notes) {
                document.getElementById('notes').value = savedData.notes;
            }

            // Restore time
            if (savedData.annotation_time_seconds) {
                document.getElementById('time_minutes').value =
                    Math.max(1, Math.round(savedData.annotation_time_seconds / 60));
            }
        }

        // Update UI
        updateAnsweredIndicators();
        updateNextButton();

        // Show initial stats
        const stats = storage.getStats();
        console.log(`Total annotations in storage: ${stats.total}`);

        // Auto-save every 30 seconds
        setInterval(() => {
            if (Object.keys(annotations).length > 0) {
                saveCurrentToStorage();
            }
        }, 30000);

        // Update next button every second
        setInterval(updateNextButton, 1000);

        console.log('=== App Initialization Complete ===');

    } catch (error) {
        console.error('Initialization error:', error);
        alert(`Failed to initialize app: ${error.message}`);
    }
}

// Helper function to render page content
async function renderPageContent() {
    // This function should be defined in the HTML file or we use template literals
    const progressPercent = ((exampleIdx + 1) / totalExamples) * 100;
    const progressBarHtml = `
        <h4 class="mb-0">
            <i class="fas fa-tasks me-2 text-primary"></i>
            Progress: Example ${exampleIdx + 1} of ${totalExamples}
        </h4>
        <div class="progress mt-2" style="height: 25px;">
            <div class="progress-bar bg-success fw-bold" role="progressbar"
                 style="width: ${progressPercent}%">
                ${progressPercent.toFixed(1)}%
            </div>
        </div>
    `;

    // Update progress section
    const progressHeader = document.querySelector('.card-header .row .col-12 .d-flex');
    if (progressHeader) {
        progressHeader.innerHTML = progressBarHtml;
    }

    // Update example content (prompt, chosen, rejected, etc.)
    // This would need to be more comprehensive in the actual HTML
    updateExampleContent();
}

function updateExampleContent() {
    // Update all dynamic content on the page
    const elements = {
        prompt: document.querySelector('[data-field="prompt"]'),
        category: document.querySelector('[data-field="category"]'),
        country: document.querySelector('[data-field="country"]'),
        chosenText: document.querySelector('[data-field="chosen_text"]'),
        chosenModel: document.querySelector('[data-field="chosen_model"]')
    };

    if (elements.prompt && currentExample.prompt) {
        elements.prompt.textContent = currentExample.prompt;
    }
    if (elements.category && currentExample.category) {
        elements.category.textContent = currentExample.category;
    }
    if (elements.country && currentExample.country) {
        elements.country.textContent = currentExample.country;
    }
    if (elements.chosenText && currentExample.chosen && currentExample.chosen[0]) {
        elements.chosenText.textContent = currentExample.chosen[0];
    }
    if (elements.chosenModel && currentExample.chosen_model && currentExample.chosen_model[0]) {
        elements.chosenModel.textContent = currentExample.chosen_model[0];
    }

    // Update rejected completions
    for (let i = 0; i < 3; i++) {
        const rejectedText = document.querySelector(`[data-field="rejected_text_${i}"]`);
        const rejectedModel = document.querySelector(`[data-field="rejected_model_${i}"]`);

        if (rejectedText && currentExample.rejected && currentExample.rejected[i]) {
            rejectedText.textContent = currentExample.rejected[i];
        }
        if (rejectedModel && currentExample.rejected_model && currentExample.rejected_model[i]) {
            rejectedModel.textContent = currentExample.rejected_model[i];
        }
    }
}

// Wait for DOM and then initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    initializeApp();
});

// Also make functions globally available for onclick handlers
window.previousExample = previousExample;
window.nextExample = nextExample;
window.selectJudgment = selectJudgment;
window.selectConfidence = selectConfidence;
window.handleDownloadClick = handleDownloadClick;
