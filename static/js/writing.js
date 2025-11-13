// Writing task JavaScript functionality

const annotations = {};
let startTime = Date.now();

function updateNextButton() {
    const nextBtn = document.getElementById('nextBtn');
    const nextBtnText = document.getElementById('nextBtnText');
    const humanCompletion = document.getElementById('human_completion').value.trim();

    if (humanCompletion.length > 20) { // Require at least some meaningful content
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
            nextBtnText.textContent = 'Write Completion to Continue';
        } else {
            nextBtnText.textContent = 'Write Completion to Submit';
        }
    }
}

function getCompletionLength() {
    const text = document.getElementById('human_completion').value.trim();
    return text.length;
}

function showIncompleteWarning() {
    const currentLength = getCompletionLength();
    const minRequired = 20;

    // Create and show warning modal
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
                            <p class="text-muted">You must write at least ${minRequired} characters before continuing.</p>
                        </div>
                        <div class="alert alert-light border">
                            <h6 class="alert-heading">Current status:</h6>
                            <p class="mb-0">
                                <strong>Characters written:</strong> ${currentLength} / ${minRequired}<br>
                                <strong>Remaining:</strong> ${Math.max(0, minRequired - currentLength)} characters
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

    // Remove existing modal if any
    const existingModal = document.getElementById('incompleteWritingModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = new bootstrap.Modal(document.getElementById('incompleteWritingModal'));
    modal.show();
}

function showAutoSaveIndicator() {
    const indicator = document.getElementById('autosaveIndicator');
    indicator.classList.add('show');

    setTimeout(() => {
        indicator.classList.remove('show');
    }, 2000);
}

function updateAutoSaveStatus() {
    const status = document.getElementById('autosave_status');
    const now = new Date().toLocaleTimeString();
    status.innerHTML = `<i class="fas fa-check-circle me-1 text-success"></i> Last saved: ${now}`;
}

function autoSave() {
    const humanCompletion = document.getElementById('human_completion').value;
    const notes = document.getElementById('writing_notes').value;
    const timeMinutes = document.getElementById('writing_time_minutes').value;
    const annotationTimeSeconds = timeMinutes ? parseInt(timeMinutes) * 60 : 0;

    const currentData = {
        human_completion: humanCompletion,
        notes: notes,
        annotation_time_seconds: annotationTimeSeconds || 0
    };

    const payload = {
        annotator_id: annotatorId,
        task_type: taskType,
        language: language,
        annotations: {
            [exampleId]: currentData
        }
    };

    fetch('/api/save_progress', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        showAutoSaveIndicator();
        updateAutoSaveStatus();
        updateNextButton();
    })
    .catch(error => {
        console.error('Auto-save failed:', error);
    });
}

function previousExample() {
    if (exampleIdx > 0) {
        autoSave();
        const url = new URL(window.location);
        url.searchParams.set('example_idx', exampleIdx - 1);
        window.location.href = url.toString();
    }
}

function nextExample() {
    // Check if completion is written
    const currentLength = getCompletionLength();
    const minRequired = 20;

    if (currentLength < minRequired) {
        showIncompleteWarning();
        return;
    }

    autoSave();

    if (exampleIdx + 1 < totalExamples) {
        const url = new URL(window.location);
        url.searchParams.set('example_idx', exampleIdx + 1);
        window.location.href = url.toString();
    } else {
        submitBatch();
    }
}

function submitBatch() {
    if (!confirm('Are you sure you want to submit all your completions? This will save your work and complete the task.')) {
        return;
    }

    const submitBtn = document.getElementById('nextBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Submitting...';

    fetch('/api/submit_batch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            annotator_id: annotatorId,
            task_type: taskType,
            language: language,
            annotations: progress
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showSuccessMessage(data.annotations_count, data.output_file);
        }
    })
    .catch(error => {
        console.error('Submission failed:', error);
        alert('An error occurred while submitting your completions. Please try again.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span id="nextBtnText">Submit All Completions</span><i class="fas fa-check-circle ms-1"></i>';
    });
}

function downloadAnnotationsFromAPI() {
    // Disable button during download
    const downloadBtn = document.getElementById('downloadBtn');
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Preparing...';

    // Prepare annotation data
    const annotationData = {
        annotator_id: annotatorId,
        task_type: taskType,
        language: language,
        annotations: progress
    };

    // Call API to prepare download
    fetch('/api/download_annotations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(annotationData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Download the file
            downloadAnnotations(data.data, data.filename);

            // Re-enable button
            downloadBtn.disabled = false;
            downloadBtn.innerHTML = '<i class="fas fa-download me-1"></i> Download';
        } else {
            console.error('Download preparation failed:', data.message);
            alert('Failed to prepare download: ' + data.message);

            // Re-enable button
            downloadBtn.disabled = false;
            downloadBtn.innerHTML = '<i class="fas fa-download me-1"></i> Download';
        }
    })
    .catch(error => {
        console.error('Download failed:', error);
        alert('An error occurred while preparing the download. Please try again.');

        // Re-enable button
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<i class="fas fa-download me-1"></i> Download';
    });
}

// For backward compatibility with existing HTML onclick handlers
function downloadAnnotations() {
    downloadAnnotationsFromAPI();
}

function downloadAnnotations(annotations, filename) {
    // Create a Blob with the JSON data
    const dataStr = JSON.stringify(annotations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    // Create a temporary download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = filename;

    // Programmatically click the link to trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show download confirmation
    showDownloadConfirmation(filename);
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

    // Auto-remove after 5 seconds
    setTimeout(() => {
        const alert = document.getElementById('downloadAlert');
        if (alert) {
            alert.remove();
        }
    }, 5000);
}

function showSuccessMessage(count, outputFile) {
    const timestamp = new Date().toISOString().slice(0, 10);
    const downloadFilename = `cultural_writing_${annotatorId}_${timestamp}.json`;

    const modalHtml = `
        <div class="modal fade" id="successModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h3 class="modal-title">
                            <i class="fas fa-check-circle me-2"></i>
                            Success!
                        </h3>
                    </div>
                    <div class="modal-body py-4">
                        <div class="text-center mb-4">
                            <i class="fas fa-trophy fs-1 text-success mb-3"></i>
                            <h4>Your completions have been saved!</h4>
                            <p class="lead">You completed ${count} examples. Thank you for your contribution!</p>
                        </div>

                        <div class="row">
                            <div class="col-md-12">
                                <div class="alert alert-light border-2">
                                    <h5 class="alert-heading"><i class="fas fa-save me-2"></i>
                                    Server-Saved File</h5>
                                    <p class="mb-2">Your completions are safely stored on the server:</p>
                                    <code class="text-break d-block bg-white p-2 rounded">${outputFile}</code>
                                </div>
                            </div>
                        </div>

                        <div class="row mt-3">
                            <div class="col-md-12">
                                <div class="alert alert-primary border-2">
                                    <h5 class="alert-heading"><i class="fas fa-download me-2"></i>
                                    Download Your Local Copy</h5>
                                    <p class="mb-3">Download a copy of your completions to your computer:</p>
                                    <button type="button" class="btn btn-primary btn-lg w-100" onclick='downloadAnnotations(${JSON.stringify(progress)}, "${downloadFilename}")'>
                                        <i class="fas fa-download me-2"></i>
                                        Download Completions (JSON)
                                    </button>
                                    <div class="form-text mt-2"><i class="fas fa-info-circle me-1"></i>
                                    File will be saved to your Downloads folder</div>
                                </div>
                            </div>
                        </div>

                        <div class="alert alert-warning border-0 mt-3">
                            <h6 class="alert-heading"><i class="fas fa-exclamation-triangle me-2"></i>
                            Important</h6>
                            <ul class="mb-0 small">
                                <li>The server copy is stored in the project folder</li>
                                <li>Download your local copy as a backup</li>
                                <li>Both files contain the same data</li>
                            </ul>
                        </div>
                    </div>
                    <div class="modal-footer justify-content-between">
                        <a href="/" class="btn btn-success">
                            <i class="fas fa-home me-1"></i>
                            Return to Home
                        </a>
                        <button type="button" class="btn btn-outline-primary" onclick='downloadAnnotations(${JSON.stringify(progress)}, "${downloadFilename}")'>
                            <i class="fas fa-download me-1"></i>
                            Download Again
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = new bootstrap.Modal(document.getElementById('successModal'));
    modal.show();

    // Auto-download the file when modal opens
    setTimeout(() => {
        downloadAnnotations(progress, downloadFilename);
    }, 1000);

    document.getElementById('successModal').addEventListener('hidden.bs.modal', function () {
        window.location.href = '/';
    });
}

// Auto-save every 5 seconds
setInterval(autoSave, 5000);

// Check for minimum content
setInterval(updateNextButton, 1000);

// Initialize
updateNextButton();

// Count words/characters
function updateWordCount() {
    const textarea = document.getElementById('human_completion');
    const text = textarea.value.trim();
    const words = text === '' ? 0 : text.split(/\s+/).length;
    const chars = text.length;

    // Remove existing word count
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

document.getElementById('human_completion').addEventListener('input', updateWordCount);
