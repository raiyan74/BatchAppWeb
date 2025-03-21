// Global variables
let selectedImages = [];
let logoImage = null;
let laceImage = null;
let selectedPosition = null;
let logoSize = 3;
let laceOpacity = 30;
let processedImages = [];

// DOM Elements
const imageInput = document.getElementById('image-input');
const logoInput = document.getElementById('logo-input');
const laceInput = document.getElementById('lace-input');
const imageCountEl = document.getElementById('image-count');
const logoNameEl = document.getElementById('logo-name');
const laceNameEl = document.getElementById('lace-name');
const positionButtons = document.querySelectorAll('.position-button');
const positionValueEl = document.getElementById('position-value');
const logoSizeSlider = document.getElementById('logo-size');
const logoSizeValueEl = document.getElementById('logo-size-value');
const laceOpacitySlider = document.getElementById('lace-opacity');
const laceOpacityValueEl = document.getElementById('lace-opacity-value');
const previewCanvas = document.getElementById('preview-canvas');
const processButton = document.getElementById('process-button');
const progressContainer = document.querySelector('.progress-container');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const gallery = document.getElementById('gallery');

// Event Listeners
imageInput.addEventListener('change', handleImageSelection);
logoInput.addEventListener('change', handleLogoSelection);
laceInput.addEventListener('change', handleLaceSelection);

positionButtons.forEach(button => {
    button.addEventListener('click', () => {
        positionButtons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        selectedPosition = button.getAttribute('data-position');
        
        let horizontalValue = 5;
        let verticalValue = 5;
        
        if (selectedPosition === 'top-right' || selectedPosition === 'bottom-right') {
            horizontalValue = 80;
        }
        
        if (selectedPosition === 'bottom-left' || selectedPosition === 'bottom-right') {
            verticalValue = 90;
        }
        
        positionValueEl.textContent = `Selected Position: ${selectedPosition} (${horizontalValue}, ${verticalValue})`;
        updatePreview();
        checkIfReadyToProcess();
    });
});

logoSizeSlider.addEventListener('input', () => {
    logoSize = parseInt(logoSizeSlider.value);
    logoSizeValueEl.textContent = `Logo Size: ${logoSize}`;
    updatePreview();
});

laceOpacitySlider.addEventListener('input', () => {
    laceOpacity = parseInt(laceOpacitySlider.value);
    laceOpacityValueEl.textContent = `Lace Opacity: ${laceOpacity}%`;
    updatePreview();
});

processButton.addEventListener('click', processImages);

// Functions
function handleImageSelection(e) {
    selectedImages = Array.from(e.target.files);
    imageCountEl.textContent = `Selected ${selectedImages.length} image(s)`;
    
    if (selectedImages.length > 0) {
        loadImageForPreview(selectedImages[0]);
    }
    
    checkIfReadyToProcess();
}

function handleLogoSelection(e) {
    if (e.target.files.length > 0) {
        const file = e.target.files[0];
        logoNameEl.textContent = `Selected: ${file.name}`;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                logoImage = img;
                updatePreview();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    checkIfReadyToProcess();
}

function handleLaceSelection(e) {
    if (e.target.files.length > 0) {
        const file = e.target.files[0];
        laceNameEl.textContent = `Selected: ${file.name}`;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                laceImage = img;
                updatePreview();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    checkIfReadyToProcess();
}

function loadImageForPreview(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            updatePreview(img);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function updatePreview(mainImage) {
    if (!mainImage && (!selectedImages.length || !logoImage || !laceImage || !selectedPosition)) {
        previewCanvas.style.display = 'none';
        return;
    }
    
    if (!previewCanvas.getContext) {
        return; // Canvas not supported
    }
    
    if (mainImage) {
        previewCanvas.width = mainImage.width;
        previewCanvas.height = mainImage.height;
        previewCanvas.style.display = 'block';
        
        const ctx = previewCanvas.getContext('2d');
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        
        // Draw main image
        ctx.drawImage(mainImage, 0, 0, previewCanvas.width, previewCanvas.height);
        
        // Draw logo if available
        if (logoImage && selectedPosition) {
            const divisor = 7 - logoSize + 3; // Convert slider value to divisor 
            const logoWidth = previewCanvas.width / divisor;
            const logoHeight = (logoImage.height / logoImage.width) * logoWidth;
            
            let logoX = 0;
            let logoY = 0;
            
            // Set position based on selected corner
            if (selectedPosition === 'top-left') {
                logoX = previewCanvas.width * 0.05;
                logoY = previewCanvas.height * 0.05;
            } else if (selectedPosition === 'top-right') {
                logoX = (previewCanvas.width * 0.8) - (logoWidth / 2);
                logoY = previewCanvas.height * 0.05;
            } else if (selectedPosition === 'bottom-left') {
                logoX = previewCanvas.width * 0.05;
                logoY = (previewCanvas.height * 0.9) - (logoHeight / 4);
            } else if (selectedPosition === 'bottom-right') {
                logoX = (previewCanvas.width * 0.8) - (logoWidth / 2);
                logoY = (previewCanvas.height * 0.9) - (logoHeight / 4);
            }
            
            ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
        }
        
        // Draw lace if available
        if (laceImage) {
            const laceWidth = previewCanvas.width;
            const laceHeight = laceWidth / 11;
            const laceY = previewCanvas.height * 0.75;
            
            ctx.globalAlpha = laceOpacity / 100;
            ctx.drawImage(laceImage, 0, laceY, laceWidth, laceHeight);
            ctx.globalAlpha = 1.0;
        }
    }
}

function checkIfReadyToProcess() {
    if (selectedImages.length > 0 && logoImage && laceImage && selectedPosition) {
        processButton.disabled = false;
    } else {
        processButton.disabled = true;
    }
}

function processImages() {
    if (selectedImages.length === 0 || !logoImage || !laceImage || !selectedPosition) {
        alert('Please complete all required inputs before processing');
        return;
    }
    
    processedImages = [];
    gallery.innerHTML = '';
    progressContainer.style.display = 'block';
    progressBar.value = 0;
    progressText.textContent = `Processing 0/${selectedImages.length} images...`;
    
    let processed = 0;
    
    // Process each image asynchronously
    selectedImages.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const processedImageDataUrl = processImage(img);
                processedImages.push({
                    name: file.name,
                    dataUrl: processedImageDataUrl
                });
                
                processed++;
                progressBar.value = (processed / selectedImages.length) * 100;
                progressText.textContent = `Processing ${processed}/${selectedImages.length} images...`;
                
                // Add to gallery
                addImageToGallery(processedImageDataUrl, file.name);
                
                // Check if all processing is complete
                if (processed === selectedImages.length) {
                    progressText.textContent = `Completed processing ${selectedImages.length} images!`;
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function processImage(mainImage) {
    const canvas = document.createElement('canvas');
    canvas.width = mainImage.width;
    canvas.height = mainImage.height;
    
    const ctx = canvas.getContext('2d');
    
    // Draw main image
    ctx.drawImage(mainImage, 0, 0, canvas.width, canvas.height);
    
    // Draw logo
    const divisor = 7 - logoSize + 3; // Convert slider value to divisor
    const logoWidth = canvas.width / divisor;
    const logoHeight = (logoImage.height / logoImage.width) * logoWidth;
    
    let logoX = 0;
    let logoY = 0;
    
    // Set position based on selected corner
    if (selectedPosition === 'top-left') {
        logoX = canvas.width * 0.05;
        logoY = canvas.height * 0.05;
    } else if (selectedPosition === 'top-right') {
        logoX = (canvas.width * 0.8) - (logoWidth / 2);
        logoY = canvas.height * 0.05;
    } else if (selectedPosition === 'bottom-left') {
        logoX = canvas.width * 0.05;
        logoY = (canvas.height * 0.9) - (logoHeight / 4);
    } else if (selectedPosition === 'bottom-right') {
        logoX = (canvas.width * 0.8) - (logoWidth / 2);
        logoY = (canvas.height * 0.9) - (logoHeight / 4);
    }
    
    ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
    
    // Draw lace with opacity
    const laceWidth = canvas.width;
    const laceHeight = laceWidth / 11;
    const laceY = canvas.height * 0.75;
    
    ctx.globalAlpha = laceOpacity / 100;
    ctx.drawImage(laceImage, 0, laceY, laceWidth, laceHeight);
    ctx.globalAlpha = 1.0;
    
    return canvas.toDataURL('image/jpeg');
}

function addImageToGallery(dataUrl, fileName) {
    const container = document.createElement('div');
    container.style.position = 'relative';
    
    const img = document.createElement('img');
    img.src = dataUrl;
    img.className = 'result-image';
    img.title = fileName;
    
    const downloadBtn = document.createElement('a');
    downloadBtn.href = dataUrl;
    downloadBtn.download = fileName.replace(/\.[^/.]+$/, "") + '_processed.jpg';
    downloadBtn.textContent = 'Download';
    downloadBtn.style.display = 'block';
    downloadBtn.style.marginTop = '5px';
    downloadBtn.style.textAlign = 'center';
    downloadBtn.style.backgroundColor = '#3498db';
    downloadBtn.style.color = 'white';
    downloadBtn.style.textDecoration = 'none';
    downloadBtn.style.padding = '5px';
    downloadBtn.style.borderRadius = '3px';
    
    container.appendChild(img);
    container.appendChild(downloadBtn);
    gallery.appendChild(container);
}