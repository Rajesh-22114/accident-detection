/**
 * AI Accident Detection System - Main Application Logic
 */

let selectedFile = null;
let currentImageUrl = null;
let currentPredictionResult = null;

// High quality embedded sample images for instant 1-click testing
const SAMPLE_IMAGES = {
    accident: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='600' height='400' fill='%231e293b'/><path d='M100 300 L250 200 L300 240 L450 150 L550 300 Z' fill='%23334155'/><circle cx='280' cy='220' r='40' fill='%23ef4444' opacity='0.8'/><text x='300' y='80' fill='%23ffffff' font-family='sans-serif' font-size='24' font-weight='bold' text-anchor='middle'>[Sample Road Incident Scenario]</text><text x='300' y='360' fill='%23f87171' font-family='sans-serif' font-size='16' text-anchor='middle'>Collision Vehicle Impact Zone</text></svg>",
    safe: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='600' height='400' fill='%230f172a'/><rect x='0' y='200' width='600' height='200' fill='%231e293b'/><line x1='0' y1='300' x2='600' y2='300' stroke='%23f59e0b' stroke-width='8' stroke-dasharray='30 20'/><circle cx='200' cy='240' r='25' fill='%2338bdf8'/><circle cx='400' cy='250' r='25' fill='%2310b981'/><text x='300' y='80' fill='%23ffffff' font-family='sans-serif' font-size='24' font-weight='bold' text-anchor='middle'>[Sample Clear Traffic Highway]</text><text x='300' y='360' fill='%2334d399' font-family='sans-serif' font-size='16' text-anchor='middle'>Normal Highway Conditions</text></svg>"
};

document.addEventListener("DOMContentLoaded", () => {
    initDropzone();
    initUrlLoader();
    initSamplePills();
});

/* Toast Notification Utility */
function showToast(message, type = "danger") {
    const toastEl = document.getElementById("cyberToast");
    const toastBody = document.getElementById("toastMessage");
    const toastIcon = document.getElementById("toastIcon");

    toastBody.innerText = message;
    if (type === "danger") {
        toastIcon.className = "bi bi-exclamation-triangle-fill text-danger me-2";
    } else if (type === "success") {
        toastIcon.className = "bi bi-check-circle-fill text-success me-2";
    } else {
        toastIcon.className = "bi bi-info-circle-fill text-info me-2";
    }

    const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
    toast.show();
}

/* Drag and Drop Zone Initialization */
function initDropzone() {
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");

    if (!dropZone || !fileInput) return;

    dropZone.addEventListener("click", () => fileInput.click());

    ["dragenter", "dragover"].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add("dragover");
        });
    });

    ["dragleave", "drop"].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove("dragover");
        });
    });

    dropZone.addEventListener("drop", (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
}

/* Handle selected local image file */
function handleFileSelect(file) {
    if (!file.type.match("image.*")) {
        showToast("Please select a valid image file (JPG, JPEG, PNG, WEBP).", "danger");
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        showToast("File size exceeds 10MB limit.", "danger");
        return;
    }

    selectedFile = file;
    currentImageUrl = null;

    const reader = new FileReader();
    reader.onload = (e) => {
        showPreview(e.target.result, file.name);
    };
    reader.readAsDataURL(file);
}

/* Image URL Loader */
function initUrlLoader() {
    const loadBtn = document.getElementById("loadUrlBtn");
    const urlInput = document.getElementById("imageUrlInput");

    if (!loadBtn || !urlInput) return;

    loadBtn.addEventListener("click", () => {
        const url = urlInput.value.trim();
        if (!url) {
            showToast("Please enter a valid image URL.", "danger");
            return;
        }

        selectedFile = null;
        currentImageUrl = url;
        showPreview(url, "URL Image");
    });
}

/* Sample Image Loader */
function initSamplePills() {
    const sampleAccidentBtn = document.getElementById("sampleAccidentBtn");
    const sampleSafeBtn = document.getElementById("sampleSafeBtn");

    if (sampleAccidentBtn) {
        sampleAccidentBtn.addEventListener("click", () => {
            selectedFile = null;
            currentImageUrl = SAMPLE_IMAGES.accident;
            showPreview(SAMPLE_IMAGES.accident, "Sample Road Incident");
            showToast("Loaded sample accident image.", "info");
        });
    }

    if (sampleSafeBtn) {
        sampleSafeBtn.addEventListener("click", () => {
            selectedFile = null;
            currentImageUrl = SAMPLE_IMAGES.safe;
            showPreview(SAMPLE_IMAGES.safe, "Sample Clear Traffic");
            showToast("Loaded sample clear road image.", "info");
        });
    }
}

/* Render Preview Thumbnail & enable Predict button */
function showPreview(imageSrc, filename) {
    const previewImg = document.getElementById("previewImage");
    const previewContainer = document.getElementById("previewContainer");
    const previewFilename = document.getElementById("previewFilename");
    const analyzeBtn = document.getElementById("analyzeBtn");

    previewImg.src = imageSrc;
    previewFilename.innerText = filename || "Uploaded Image";
    previewContainer.classList.remove("d-none");
    analyzeBtn.removeAttribute("disabled");

    // Scroll to preview box
    previewContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* Run AI Accident Detection Analysis */
async function runAnalysis() {
    if (!selectedFile && !currentImageUrl) {
        showToast("Please upload or select an image first.", "danger");
        return;
    }

    const analyzeBtn = document.getElementById("analyzeBtn");
    const progressBar = document.getElementById("uploadProgressBar");
    const progressContainer = document.getElementById("progressContainer");
    const analysisSection = document.getElementById("analysisSection");
    const scannerImage = document.getElementById("scannerImage");
    const laserScanLine = document.getElementById("laserScanLine");
    const scanGridOverlay = document.getElementById("scanGridOverlay");
    const resultsCard = document.getElementById("resultsCard");

    // UI Loading state setup
    analyzeBtn.setAttribute("disabled", "true");
    progressContainer.classList.remove("d-none");
    progressBar.style.width = "20%";

    // Set image in scanner viewport
    const previewSrc = document.getElementById("previewImage").src;
    scannerImage.src = previewSrc;

    // Show scanner section
    analysisSection.classList.remove("d-none");
    laserScanLine.style.display = "block";
    scanGridOverlay.style.display = "block";
    resultsCard.classList.add("d-none");

    analysisSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Progress simulation
    let progress = 20;
    const progressInterval = setInterval(() => {
        if (progress < 90) {
            progress += 15;
            progressBar.style.width = `${progress}%`;
        }
    }, 200);

    try {
        let response;
        if (selectedFile) {
            const formData = new FormData();
            formData.append("file", selectedFile);
            response = await fetch("/predict", {
                method: "POST",
                body: formData
            });
        } else {
            response = await fetch("/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image_url: currentImageUrl })
            });
        }

        clearInterval(progressInterval);
        progressBar.style.width = "100%";

        const data = await response.json();

        if (data.error) {
            laserScanLine.style.display = "none";
            scanGridOverlay.style.display = "none";
            showToast(data.error, "danger");
            analyzeBtn.removeAttribute("disabled");
            return;
        }

        currentPredictionResult = data;

        // Render Prediction Output
        setTimeout(() => {
            laserScanLine.style.display = "none";
            scanGridOverlay.style.display = "none";
            renderResults(data);
            analyzeBtn.removeAttribute("disabled");
        }, 600);

    } catch (err) {
        clearInterval(progressInterval);
        laserScanLine.style.display = "none";
        scanGridOverlay.style.display = "none";
        analyzeBtn.removeAttribute("disabled");
        showToast("Network error or model server timeout: " + err.message, "danger");
    }
}

/* Render Dashboard Results */
function renderResults(data) {
    const resultsCard = document.getElementById("resultsCard");
    const predictionBadge = document.getElementById("predictionBadge");
    const confidenceText = document.getElementById("confidenceText");
    const confidenceBar = document.getElementById("confidenceBar");
    const riskBadge = document.getElementById("riskBadge");
    const explanationText = document.getElementById("explanationText");
    const timestampText = document.getElementById("timestampText");
    const accidentProbText = document.getElementById("accidentProbText");
    const safeProbText = document.getElementById("safeProbText");

    const isAccident = data.prediction === "Accident";

    // 1. Badge & Styling
    if (isAccident) {
        predictionBadge.className = "badge-accident";
        predictionBadge.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-2"></i>Accident Detected`;
        confidenceBar.className = "progress-bar progress-bar-accident";
        riskBadge.className = "badge bg-danger text-white px-3 py-2 fs-6";
        riskBadge.innerHTML = `<i class="bi bi-shield-fill-x me-1"></i> HIGH RISK DETECTED`;
        
        explanationText.innerHTML = `
            <strong>AI Alert:</strong> Vehicle impact / road crash pattern detected with 
            <span class="text-danger fw-bold">${data.confidence}%</span> model confidence. 
            Emergency dispatch or traffic management review is recommended immediately.
        `;
    } else {
        predictionBadge.className = "badge-safe";
        predictionBadge.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>No Accident Detected`;
        confidenceBar.className = "progress-bar progress-bar-safe";
        riskBadge.className = "badge bg-success text-white px-3 py-2 fs-6";
        riskBadge.innerHTML = `<i class="bi bi-shield-fill-check me-1"></i> NORMAL ROAD CONDITIONS`;

        explanationText.innerHTML = `
            <strong>AI Status:</strong> Normal roadway environment. No collision indicators found. 
            Confidence score: <span class="text-success fw-bold">${data.confidence}%</span>.
        `;
    }

    // 2. Metrics
    confidenceText.innerText = `${data.confidence}%`;
    confidenceBar.style.width = `${data.confidence}%`;

    if (accidentProbText) accidentProbText.innerText = `${data.accident_probability || 0}%`;
    if (safeProbText) safeProbText.innerText = `${data.non_accident_probability || 0}%`;

    timestampText.innerText = `Analyzed on ${data.timestamp || new Date().toLocaleString()} (${data.processing_time || '< 1s'})`;

    // 3. Show Results Card
    resultsCard.classList.remove("d-none");
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* Download AI Diagnostic Report */
function downloadReport() {
    if (!currentPredictionResult) {
        showToast("No active analysis result to download.", "danger");
        return;
    }

    const reportContent = {
        title: "AI-Powered Accident Detection Diagnostic Report",
        system: "Xception Deep Learning Classifier v2.4",
        timestamp: currentPredictionResult.timestamp,
        analysis: {
            prediction: currentPredictionResult.prediction,
            confidence_percentage: currentPredictionResult.confidence,
            accident_probability: `${currentPredictionResult.accident_probability}%`,
            non_accident_probability: `${currentPredictionResult.non_accident_probability}%`,
            risk_level: currentPredictionResult.risk_level,
            processing_latency: currentPredictionResult.processing_time
        },
        recommendation: currentPredictionResult.prediction === "Accident" 
            ? "CRITICAL: Automated crash signature detected. Alert nearest emergency services." 
            : "CLEAR: Normal traffic flow detected. No action required."
    };

    const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Accident_Detection_Report_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast("Report downloaded successfully!", "success");
}

/* Reset UI to analyze another image */
function resetAnalysis() {
    selectedFile = null;
    currentImageUrl = null;
    currentPredictionResult = null;

    document.getElementById("fileInput").value = "";
    document.getElementById("imageUrlInput").value = "";
    document.getElementById("previewContainer").classList.add("d-none");
    document.getElementById("analysisSection").classList.add("d-none");
    document.getElementById("resultsCard").classList.add("d-none");
    document.getElementById("progressContainer").classList.add("d-none");
    document.getElementById("analyzeBtn").setAttribute("disabled", "true");

    document.getElementById("uploadSection").scrollIntoView({ behavior: 'smooth' });
}
