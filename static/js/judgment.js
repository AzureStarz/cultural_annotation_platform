// Judgment task JavaScript functionality

const annotations = {};
let currentConfidence = null;
let startTime = Date.now();

function selectJudgment(field, value) {
    annotations[field] = value;

    const yesBtn = document.getElementById(field.replace('_', '_') + '_yes');
    const noBtn = document.getElementById(field.replace('_', '_') + '_no');

    yesBtn.classList.remove('active');
    noBtn.classList.remove('active');

    // Add click animation class
    yesBtn.classList.remove('clicked');
    noBtn.classList.remove('clicked');

    if (value === true) {
        yesBtn.classList.add('active');
        yesBtn.classList.add('clicked');
    } else {
        noBtn.classList.add('active');
        noBtn.classList.add('clicked');
    }

    // Remove click animation class after animation completes
    setTimeout(() => {
        yesBtn.classList.remove('clicked');
        noBtn.classList.remove('clicked');
    }, 500);

    // Update visual indicators
    updateAnsweredIndicators();

    autoSave();
    updateNextButton();
}

// Add visual feedback to show which questions have been answered
function updateAnsweredIndicators() {
    // Check each judgment group and add visual indicator if answered
    const fields = [
        'chosen_alignment',
        'rejected_misalignment_0',
        'rejected_misalignment_1',
        'rejected_misalignment_2'
    ];

    fields.forEach(field => {
        const container = document.getElementById(field + '_container');
        if (container && annotations[field] !== undefined) {
            container.classList.add('answered');
        }
    });
}

function selectConfidence(level) {
    currentConfidence = level;

    document.querySelectorAll('.confidence-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById('conf_' + level).classList.add('active');

    autoSave();
    updateNextButton();
}

function isCurrentExampleComplete() {
    const hasChosenAlignment = annotations.chosen_alignment !== undefined;
    const hasRejected0 = annotations['rejected_misalignment_0'] !== undefined;
    const hasRejected1 = annotations['rejected_misalignment_1'] !== undefined;
    const hasRejected2 = annotations['rejected_misalignment_2'] !== undefined;
    const hasConfidence = currentConfidence !== null;

    return hasChosenAlignment && hasRejected0 && hasRejected1 && hasRejected2 && hasConfidence;
}

function updateNextButton() {
    const nextBtn = document.getElementById('nextBtn');
    const nextBtnText = document.getElementById('nextBtnText');

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
    const notes = document.getElementById('notes').value;
    const timeMinutes = document.getElementById('time_minutes').value;
    const annotationTimeSeconds = timeMinutes ? parseInt(timeMinutes) * 60 : 0;

    const currentData = {
        ...annotations,
        confidence: currentConfidence,
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
    // Check if all required fields are completed
    if (!isCurrentExampleComplete()) {
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

function showIncompleteWarning() {
    // Find which fields are missing
    const missingFields = [];

    if (annotations.chosen_alignment === undefined) {
        missingFields.push("Chosen Completion judgment");
    }
    if (annotations.rejected_misalignment_0 === undefined) {
        missingFields.push("Rejected #1 judgment");
    }
    if (annotations.rejected_misalignment_1 === undefined) {
        missingFields.push("Rejected #2 judgment");
    }
    if (annotations.rejected_misalignment_2 === undefined) {
        missingFields.push("Rejected #3 judgment");
    }
    if (currentConfidence === null) {
        missingFields.push("Confidence level");
    }

    const missingList = missingFields.map(field => `• ${field}`).join('\n');

    // Create and show warning modal
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
                            <pre class="mb-0 text-danger" style="white-space: pre-wrap; font-size: 0.9rem;">${missingList}</pre>
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

    // Remove existing modal if any
    const existingModal = document.getElementById('incompleteModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = new bootstrap.Modal(document.getElementById('incompleteModal'));
    modal.show();

    // Auto-remove after 5 seconds
    setTimeout(() => {
        const alert = document.getElementById('incompleteModal');
        if (alert) {
            alert.remove();
        }
    }, 5000);
}

function submitBatch() {
    if (!confirm('Are you sure you want to submit all your annotations? This will save your work and complete the task.')) {
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
        alert('An error occurred while submitting your annotations. Please try again.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span id="nextBtnText">Submit Batch</span><i class="fas fa-check-circle ms-1"></i>';
    });
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
    const downloadFilename = `cultural_annotations_${annotatorId}_${timestamp}.json`;

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
                            <h4>Your annotations have been saved!</h4>
                            <p class="lead">You completed ${count} examples. Thank you for your contribution!</p>
                        </div>

                        <div class="row">
                            <div class="col-md-12">
                                <div class="alert alert-light border-2">
                                    <h5 class="alert-heading">
                                        <i class="fas fa-save me-2"></i>
                                        Server-Saved File
                                    </h5>
                                    <p class="mb-2">Your annotations are safely stored on the server:</p>
                                    <code class="text-break d-block bg-white p-2 rounded">${outputFile}</code>
                                </div>
                            </div>
                        </div>

                        <div class="row mt-3">
                            <div class="col-md-12">
                                <div class="alert alert-primary border-2">
                                    <h5 class="alert-heading">
                                        <i class="fas fa-download me-2"></i>
                                        Download Your Local Copy
                                    </h5>
                                    <p class="mb-3">Download a copy of your annotations to your computer:</p>
                                    <button type="button" class="btn btn-primary btn-lg w-100" onclick='downloadAnnotations(${JSON.stringify(progress)}, "${downloadFilename}")'>
                                        <i class="fas fa-download me-2"></i>
                                        Download Annotations (JSON)
                                    </button>
                                    <div class="form-text mt-2">
                                        <i class="fas fa-info-circle me-1"></i>
                                        File will be saved to your Downloads folder
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="alert alert-warning border-0 mt-3">
                            <h6 class="alert-heading">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                Important
                            </h6>
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

// Initialize
updateNextButton();

// Auto-save every 30 seconds as a backup
setInterval(autoSave, 30000);
