// Meme Generator Pro - Enhanced Version
// Template data with names and paths
const templates = [
    { id: 'drake', name: 'Drake Hotline Bling', path: 'templates/drake.jpg' },
    { id: 'distracted', name: 'Distracted Boyfriend', path: 'templates/distracted-boyfriend.jpg' },
    { id: 'change-my-mind', name: 'Change My Mind', path: 'templates/change-my-mind.jpg' },
    { id: 'expanding-brain', name: 'Expanding Brain', path: 'templates/expanding-brain.jpg' },
    { id: 'one-does-not', name: 'One Does Not Simply', path: 'templates/one-does-not-simply.jpg' },
    { id: 'ancient-aliens', name: 'Ancient Aliens', path: 'templates/ancient-aliens.jpg' },
    { id: 'success-kid', name: 'Success Kid', path: 'templates/success-kid.jpg' },
    { id: 'roll-safe', name: 'Roll Safe', path: 'templates/roll-safe.jpg' },
    { id: 'evil-kermit', name: 'Evil Kermit', path: 'templates/evil-kermit.jpg' },
    { id: 'is-this-pigeon', name: 'Is This a Pigeon?', path: 'templates/is-this-a-pigeon.jpg' },
    { id: 'disaster-girl', name: 'Disaster Girl', path: 'templates/disaster-girl.jpg' },
    { id: 'hide-pain', name: 'Hide the Pain Harold', path: 'templates/hide-pain-harold.jpg' }
];

// State
let selectedTemplate = null;
let customImage = null;
let currentImage = null;
let animationFrame = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTemplateGallery();
    setupUploadHandler();
    setupTextInputs();
    setupFontControls();
    setupKeyboardShortcuts();
});

// Load template gallery
function loadTemplateGallery() {
    const gallery = document.getElementById('templateGallery');
    
    templates.forEach(template => {
        const card = document.createElement('div');
        card.className = 'template-card';
        card.dataset.id = template.id;
        
        card.innerHTML = `
            <img src="${template.path}" alt="${template.name}" loading="lazy">
            <div class="template-name">${template.name}</div>
        `;
        
        card.addEventListener('click', () => selectTemplate(template, card));
        gallery.appendChild(card);
    });
}

// Select a template
function selectTemplate(template, cardElement) {
    // Remove previous selection
    document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
    
    // Add selection to clicked card
    cardElement.classList.add('selected');
    
    // Update state
    selectedTemplate = template;
    customImage = null;
    
    // Load the image and show editor
    const img = new Image();
    img.onload = () => {
        currentImage = img;
        showEditor();
        generateMeme();
    };
    img.src = template.path;
}

// Setup file upload handler
function setupUploadHandler() {
    const uploadInput = document.getElementById('imageUpload');
    
    uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
    });
    
    // Drag and drop support
    const uploadArea = document.getElementById('uploadArea');
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFileUpload(file);
        }
    });
}

// Handle file upload
function handleFileUpload(file) {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert('File too large! Please choose an image under 10MB.');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
        customImage = e.target.result;
        
        // Clear template selection
        document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
        selectedTemplate = null;
        
        // Load image and show editor
        const img = new Image();
        img.onload = () => {
            currentImage = img;
            showEditor();
            generateMeme();
        };
        img.src = customImage;
        
        // Update upload area preview
        updateUploadPreview(customImage, file.name);
    };
    
    reader.onerror = () => {
        alert('Error reading file. Please try again.');
    };
    
    reader.readAsDataURL(file);
}

// Update upload preview
function updateUploadPreview(imageSrc, filename) {
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
        <div class="upload-preview" onclick="document.getElementById('imageUpload').click()">
            <img src="${imageSrc}" alt="Uploaded image">
            <p>${filename}</p>
            <small>Click to change</small>
        </div>
    `;
}

// Show editor section
function showEditor() {
    document.getElementById('editorSection').style.display = 'block';
    // Scroll to editor smoothly
    document.getElementById('editorSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Setup font controls
function setupFontControls() {
    const fontSizeSlider = document.getElementById('fontSize');
    const fontSizeValue = document.getElementById('fontSizeValue');
    
    fontSizeSlider.addEventListener('input', (e) => {
        fontSizeValue.textContent = e.target.value + '%';
        generateMeme();
    });
    
    // Color radio buttons
    document.querySelectorAll('input[name="textColor"]').forEach(radio => {
        radio.addEventListener('change', generateMeme);
    });
}

// Setup text input listeners
function setupTextInputs() {
    const topText = document.getElementById('topText');
    const bottomText = document.getElementById('bottomText');
    
    // Generate meme on input (with debounce)
    let debounceTimer;
    const inputs = [topText, bottomText];
    
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(generateMeme, 150);
        });
    });
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Only if editor is visible
        if (document.getElementById('editorSection').style.display === 'none') return;
        
        if (e.ctrlKey || e.metaKey) {
            switch(e.key.toLowerCase()) {
                case 's':
                    e.preventDefault();
                    downloadMeme();
                    break;
                case 'c':
                    // Only copy if not in an input
                    if (e.target.tagName !== 'INPUT') {
                        e.preventDefault();
                        copyToClipboard();
                    }
                    break;
            }
        } else if (e.key === 'Escape') {
            resetEditor();
        }
    });
}

// Generate meme on canvas
function generateMeme() {
    if (!currentImage) return;
    
    // Cancel any pending animation frame
    if (animationFrame) cancelAnimationFrame(animationFrame);
    
    animationFrame = requestAnimationFrame(() => {
        drawMeme();
    });
}

// Draw the meme
function drawMeme() {
    const canvas = document.getElementById('memeCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match image
    canvas.width = currentImage.naturalWidth || currentImage.width;
    canvas.height = currentImage.naturalHeight || currentImage.height;
    
    // Clear and draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentImage, 0, 0);
    
    // Get text
    const topText = document.getElementById('topText').value.toUpperCase().trim();
    const bottomText = document.getElementById('bottomText').value.toUpperCase().trim();
    
    // Get settings
    const fontSizePercent = parseInt(document.getElementById('fontSize').value) / 100;
    const textColor = document.querySelector('input[name="textColor"]:checked')?.value || 'white';
    
    // Configure text style
    const fontSize = Math.floor(Math.max(canvas.width, canvas.height) * fontSizePercent);
    ctx.font = `900 ${fontSize}px Impact, "Arial Black", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = textColor;
    ctx.strokeStyle = textColor === 'white' ? 'black' : 'white';
    ctx.lineWidth = fontSize / 8;
    ctx.lineJoin = 'round';
    
    // Draw top text
    if (topText) {
        const x = canvas.width / 2;
        const y = fontSize * 1.2;
        drawTextWithOutline(ctx, topText, x, y);
    }
    
    // Draw bottom text
    if (bottomText) {
        const x = canvas.width / 2;
        const y = canvas.height - fontSize * 0.3;
        drawTextWithOutline(ctx, bottomText, x, y, true);
    }
}

// Helper to draw text with outline
function drawTextWithOutline(ctx, text, x, y, fromBottom = false) {
    // Wrap text if too long
    const maxWidth = ctx.canvas.width * 0.95;
    const words = text.split(' ');
    let line = '';
    const lines = [];
    
    for (let word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line !== '') {
            lines.push(line.trim());
            line = word + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line.trim());
    
    // Calculate starting Y position
    const lineHeight = parseInt(ctx.font) * 1.1;
    let startY;
    
    if (fromBottom) {
        startY = y - (lines.length - 1) * lineHeight;
    } else {
        startY = y - (lines.length > 1 ? (lines.length - 1) * lineHeight / 2 : 0);
    }
    
    // Draw each line
    lines.forEach((lineText, index) => {
        const lineY = startY + index * lineHeight;
        // Draw stroke first (outline)
        ctx.strokeText(lineText, x, lineY);
        // Then fill
        ctx.fillText(lineText, x, lineY);
    });
}

// Download meme
function downloadMeme() {
    const canvas = document.getElementById('memeCanvas');
    
    // Create download link
    const link = document.createElement('a');
    link.download = `meme-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    // Show feedback
    showToast('💾 Meme downloaded!');
}

// Copy to clipboard
async function copyToClipboard() {
    const canvas = document.getElementById('memeCanvas');
    
    try {
        // Convert canvas to blob
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        
        // Copy to clipboard
        await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
        ]);
        
        showToast('📋 Meme copied to clipboard!');
    } catch (err) {
        // Fallback: copy as data URL
        try {
            const dataUrl = canvas.toDataURL('image/png');
            await navigator.clipboard.writeText(dataUrl);
            showToast('📋 Image URL copied!');
        } catch (fallbackErr) {
            showToast('❌ Failed to copy. Try downloading instead.');
        }
    }
}

// Show toast notification
function showToast(message) {
    // Remove existing toast
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: #22c55e;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 1000;
        animation: slideUp 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// Reset editor
function resetEditor() {
    document.getElementById('topText').value = '';
    document.getElementById('bottomText').value = '';
    document.getElementById('fontSize').value = 15;
    document.getElementById('fontSizeValue').textContent = '15%';
    document.querySelector('input[value="white"]').checked = true;
    document.getElementById('editorSection').style.display = 'none';
    document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
    
    // Reset upload area
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
        <input type="file" id="imageUpload" accept="image/*" hidden>
        <div class="upload-placeholder" onclick="document.getElementById('imageUpload').click()">
            <span class="upload-icon">📷</span>
            <p>Click or drag to upload image</p>
            <small>Supports: JPG, PNG, GIF, WebP</small>
        </div>
    `;
    
    // Re-attach upload handler
    setupUploadHandler();
    
    selectedTemplate = null;
    customImage = null;
    currentImage = null;
}
