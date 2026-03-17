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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTemplateGallery();
    setupUploadHandler();
    setupTextInputs();
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
        uploadArea.style.borderColor = 'var(--primary-light)';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--border)';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--border)';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFileUpload(file);
        }
    });
}

// Handle file upload
function handleFileUpload(file) {
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
        updateUploadPreview(customImage);
    };
    
    reader.readAsDataURL(file);
}

// Update upload preview
function updateUploadPreview(imageSrc) {
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
        <div class="upload-preview">
            <img src="${imageSrc}" alt="Uploaded image">
            <p>Image uploaded! Click to change</p>
        </div>
    `;
    uploadArea.onclick = () => document.getElementById('imageUpload').click();
}

// Show editor section
function showEditor() {
    document.getElementById('editorSection').style.display = 'block';
    // Scroll to editor
    document.getElementById('editorSection').scrollIntoView({ behavior: 'smooth' });
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
            debounceTimer = setTimeout(generateMeme, 100);
        });
    });
}

// Generate meme on canvas
function generateMeme() {
    if (!currentImage) return;
    
    const canvas = document.getElementById('memeCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match image
    canvas.width = currentImage.naturalWidth || currentImage.width;
    canvas.height = currentImage.naturalHeight || currentImage.height;
    
    // Clear and draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentImage, 0, 0);
    
    // Get text
    const topText = document.getElementById('topText').value.toUpperCase();
    const bottomText = document.getElementById('bottomText').value.toUpperCase();
    
    // Configure text style
    const fontSize = Math.floor(canvas.width / 10);
    ctx.font = `900 ${fontSize}px Impact, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
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
        const y = canvas.height - fontSize * 0.5;
        drawTextWithOutline(ctx, bottomText, x, y);
    }
}

// Helper to draw text with outline
function drawTextWithOutline(ctx, text, x, y) {
    // Wrap text if too long
    const maxWidth = ctx.canvas.width * 0.9;
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
    
    // Draw each line
    const lineHeight = parseInt(ctx.font) * 1.2;
    const startY = lines.length > 1 ? y - (lines.length - 1) * lineHeight / 2 : y;
    
    lines.forEach((lineText, index) => {
        const lineY = startY + index * lineHeight;
        ctx.strokeText(lineText, x, lineY);
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
}

// Reset editor
function resetEditor() {
    document.getElementById('topText').value = '';
    document.getElementById('bottomText').value = '';
    document.getElementById('editorSection').style.display = 'none';
    document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
    
    // Reset upload area
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
        <div class="upload-placeholder" onclick="document.getElementById('imageUpload').click()">
            <span class="upload-icon">📷</span>
            <p>Click to upload image</p>
        </div>
    `;
    
    selectedTemplate = null;
    customImage = null;
    currentImage = null;
}
