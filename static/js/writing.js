// ============================================================================
// Cultural Annotation Platform - Writing Task
// ============================================================================
// Storage System: Browser LocalStorage
// Environment: Vercel (Serverless - No file system access)
//
// Data Flow:
// 1. Completions stored in browser's LocalStorage (no server needed)
// 2. All operations happen client-side
// 3. Download button exports all completions as JSON file
// ============================================================================

let startTime = Date.now();

// ============================================================================
// STORAGE MANAGEMENT - LocalStorage based
// ============================================================================

class CompletionStorage {
    constructor(annotatorId, taskType, language) {
        this.annotatorId = annotatorId;
        this.taskType = taskType;
        this.language = language;
        this.storageKey = `cultural_completions_${annotatorId}_${taskType}_${language}`;
    }

    // Load all completions from LocalStorage
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

    // Save all completions to LocalStorage
    saveAll(completions) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(completions));
            console.log(`✓ Saved ${Object.keys(completions).length} completions to LocalStorage`);
            return true;
        } catch (error) {
            console.error('Error saving to LocalStorage:', error);
            alert('Error saving completions: ' + error.message);
            return false;
        }
    }

    // Save single completion
    save(exampleId, completionData) {
        const allCompletions = this.loadAll();
        allCompletions[exampleId] = {
            ...completionData,
            last_modified: new Date().toISOString()
        };
        return this.saveAll(allCompletions);
    }

    // Load single completion
    load(exampleId) {
        const allCompletions = this.loadAll();
        return allCompletions[exampleId];
    }

    // Get statistics
    getStats() {
        const allCompletions = this.loadAll();
        return {
            total: Object.keys(allCompletions).length,
            data: allCompletions
        };
    }

    // Clear all completions
    clear() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('Cleared all completions from LocalStorage');
            return true;
        } catch (error) {
            console.error('Error clearing LocalStorage:', error);
            return false;
        }
    }

    // Export data for download
    exportForDownload() {
        const allCompletions = this.loadAll();
        const timestamp = new Date().toISOString().slice(0, 10);

        return {
            filename: `cultural_writing_${this.annotatorId}_${this.taskType}_${this.language}_${timestamp}.json`,
            data: {
                annotator_id: this.annotatorId,
                task_type: this.taskType,
                language: this.language,
                export_timestamp: new Date().toISOString(),
                total_completions: Object.keys(allCompletions).length,
                completions: allCompletions,
                metadata: {
                    storage_type: 'browser_localstorage',
                    note: 'All data stored in browser. Make sure to back up this file!'
                }
            }
        };
    }
}

// Create global storage instance
let storage = null;
const MIN_COMPLETION_LENGTH = 20;

// ============================================================================
// UI LOGIC
// ============================================================================

function updateNextButton() {
    const nextBtn = document.getElementById('nextBtn');
    const nextBtnText = document.getElementById('nextBtnText');
    const textarea = document.getElementById('human_completion');

    if (!nextBtn || !nextBtnText || !textarea) return;

    const contentLength = textarea.value.trim().length;
    const hasEnoughContent = contentLength >= MIN_COMPLETION_LENGTH;

    if (hasEnoughContent) {
        nextBtn.classList.remove('btn-outline-secondary', 'btn-danger');
        nextBtn.classList.add('btn-success');
        nextBtn.disabled = false;

        if (exampleIdx + 1 < totalExamples) {
            nextBtnText.textContent = 'Next Example';
        } else {
            nextBtnText.textContent = 'Submit All Completions';
        }
    } else {
        nextBtn.classList.remove('btn-success');
        nextBtn.classList.add('btn-danger');
        nextBtn.disabled = false;

        if (exampleIdx + 1 < totalExamples) {
            nextBtnText.textContent = `Write at least ${MIN_COMPLETION_LENGTH} characters to continue`;
        } else {
            nextBtnText.textContent = `Write at least ${MIN_COMPLETION_LENGTH} characters to submit`;
        }
    }
}

function updateWordCount() {
    const textarea = document.getElementById('human_completion');
    const text = textarea.value.trim();
    const words = text === '' ? 0 : text.split(/\s+/).length;
    const chars = text.length;

    const existingCount = document.getElementById('wordCount');
    if (existingCount) {
        existingCount.remove();
    }

    if (text.length > 0) {
        const countHtml = `
            <div class="d-flex justify-content-between text-muted mt-2" id="wordCount">
                <small><i class="fas fa-font me-1"></i>Words: ${words}</small>
                <small><i class="fas fa-text-width me-1"></i>Characters: ${chars}</small>
            </div>
        `;
        textarea.insertAdjacentHTML('afterend', countHtml);
    }
}

function showIncompleteWarning() {
    const currentLength = document.getElementById('human_completion').value.trim().length;
    const remaining = Math.max(0, MIN_COMPLETION_LENGTH - currentLength);

    const modalHtml = `
        <div class="modal fade" id="incompleteWritingModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-warning text-dark">
                        <h3 class="modal-title">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Write Your Completion
                        </h3>
                    </div>
                    <div class="modal-body py-4">
                        <div class="text-center mb-3">
                            <i class="fas fa-pen-fancy fs-1 text-warning mb-3"></i>
                            <h4>Please write a completion first</h4>
                            <p class="text-muted">You must write at least ${MIN_COMPLETION_LENGTH} characters before continuing.</p>
                        </div>
                        <div class="alert alert-light border">
                            <h6 class="alert-heading">Current status:</h6>
                            <p class="mb-0">
                                <strong>Characters written:</strong> ${currentLength} / ${MIN_COMPLETION_LENGTH}<br>
                                <strong>Remaining:</strong> ${remaining} characters
                            </p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-warning btn-lg w-100" data-bs-dismiss="modal">
                            <i class="fas fa-edit me-1"></i>
                            Go Back and Write
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const existingModal = document.getElementById('incompleteWritingModal');
    if (existingModal) existingModal.remove();

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('incompleteWritingModal'));
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
                            All Completions Complete!
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
                            <strong>Important:</strong> Your completions are stored in browser memory.
                            Download the file to keep a permanent record!
                        </div>
                        <p class="mb-0">
                            <i class="fas fa-save text-success me-2"></i>
                            You have completed ${stats.total} examples in total (including this session).
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
// NAVIGATION & SAVING
// ============================================================================

function saveCurrentToStorage() {
    if (!storage || !exampleId) return false;

    const humanCompletion = document.getElementById('human_completion').value;
    const notes = document.getElementById('writing_notes').value;
    const timeMinutes = document.getElementById('writing_time_minutes').value;
    const annotationTimeSeconds = timeMinutes ? parseInt(timeMinutes) * 60 : 0;

    const currentData = {
        human_completion: humanCompletion,
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
    const currentLength = document.getElementById('human_completion').value.trim().length;

    if (currentLength < MIN_COMPLETION_LENGTH) {
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

    console.log('Completions to download:', exportData.data);
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
// INITIALIZATION
// ============================================================================

function initializeApp() {
    console.log('=== Initializing Cultural Writing App ===');
    console.log('Annotator ID:', annotatorId);
    console.log('Task Type:', taskType);
    console.log('Language:', language);
    console.log('Example ID:', exampleId);

    // Initialize storage system
    storage = new CompletionStorage(annotatorId, taskType, language);

    // Load saved progress for current example
    const savedData = storage.load(exampleId);
    if (savedData) {
        console.log('Found saved data for this example:', savedData);

        if (savedData.human_completion) {
            document.getElementById('human_completion').value = savedData.human_completion;
        }
        if (savedData.notes) {
            document.getElementById('writing_notes').value = savedData.notes;
        }
        if (savedData.annotation_time_seconds) {
            document.getElementById('writing_time_minutes').value =
                Math.max(1, Math.round(savedData.annotation_time_seconds / 60));
        }
    }

    // Update UI
    updateNextButton();
    updateWordCount();

    // Show initial stats
    const stats = storage.getStats();
    console.log(`Total completions in storage: ${stats.total}`);

    // Auto-save every 30 seconds
    setInterval(() => {
        const hasContent = document.getElementById('human_completion').value.trim().length > 0;
        if (hasContent) {
            saveCurrentToStorage();
        }
    }, 30000);

    // Update next button every second
    setInterval(updateNextButton, 1000);

    // Update word count on input
    document.getElementById('human_completion').addEventListener('input', updateWordCount);

    console.log('=== App Initialization Complete ===');
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);
