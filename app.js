// Meme Generator Pro - Enhanced Version with API Integration
// API Configuration for fetching memes from Imgflip
const API = {
    baseUrl: 'https://api.imgflip.com',
    
    async getPopularMemes() {
        try {
            const response = await fetch(`${this.baseUrl}/get_memes`);
            const data = await response.json();
            if (data.success) {
                return data.data.memes.slice(0, 50); // Get top 50 memes
            }
            return [];
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },
    
    async searchMemes(query, memes) {
        // Search through fetched memes
        const searchLower = query.toLowerCase();
        return memes.filter(meme => 
            meme.name.toLowerCase().includes(searchLower)
        );
    }
};

// Local templates as fallback
const localTemplates = [
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
let fetchedMemes = [];

// Undo/Redo history
const memeHistory = {
    past: [],
    future: [],
    maxSize: 20,
    saveState() {
        const state = {
            topText: document.getElementById('topText').value,
            bottomText: document.getElementById('bottomText').value,
            fontSize: document.getElementById('fontSize').value,
            textColor: document.querySelector('input[name="textColor"]:checked')?.value || 'white',
            timestamp: Date.now()
        };
        // Don't save if same as last state
        if (this.past.length > 0) {
            const last = this.past[this.past.length - 1];
            if (last.topText === state.topText && 
                last.bottomText === state.bottomText &&
                last.fontSize === state.fontSize &&
                last.textColor === state.textColor) {
                return;
            }
        }
        this.past.push(state);
        if (this.past.length > this.maxSize) this.past.shift();
        this.future = []; // Clear redo stack on new action
        updateUndoRedoButtons();
    },
    undo() {
        if (this.past.length === 0) return null;
        const current = {
            topText: document.getElementById('topText').value,
            bottomText: document.getElementById('bottomText').value,
            fontSize: document.getElementById('fontSize').value,
            textColor: document.querySelector('input[name="textColor"]:checked')?.value || 'white'
        };
        this.future.unshift(current);
        const state = this.past.pop();
        updateUndoRedoButtons();
        return state;
    },
    redo() {
        if (this.future.length === 0) return null;
        const current = {
            topText: document.getElementById('topText').value,
            bottomText: document.getElementById('bottomText').value,
            fontSize: document.getElementById('fontSize').value,
            textColor: document.querySelector('input[name="textColor"]:checked')?.value || 'white'
        };
        this.past.push(current);
        const state = this.future.shift();
        updateUndoRedoButtons();
        return state;
    },
    canUndo() { return this.past.length > 0; },
    canRedo() { return this.future.length > 0; }
};
let isOnline = navigator.onLine;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load templates based on connection status
    loadTemplates();
    setupUploadHandler();
    setupTextInputs();
    setupFontControls();
    setupKeyboardShortcuts();
    setupSearch();
    setupUndoRedo();
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
        isOnline = true;
        showToast('🌐 Back online! Fetching fresh templates...');
        loadTemplates();
    });
    
    window.addEventListener('offline', () => {
        isOnline = false;
        showToast('⚠️ Offline mode - Using local templates');
    });
});

// Load templates from API or fallback to local
async function loadTemplates() {
    const gallery = document.getElementById('templateGallery');
    
    // Show loading state
    gallery.innerHTML = '<div class="loading-templates">⏳ Loading templates...</div>';
    
    if (isOnline) {
        fetchedMemes = await API.getPopularMemes();
    }
    
    // Use API results or fallback to local
    const templatesToShow = fetchedMemes.length > 0 ? fetchedMemes : localTemplates;
    renderTemplates(templatesToShow);
    
    // Add indicator showing template source
    updateTemplateSourceIndicator(fetchedMemes.length > 0 ? 'api' : 'local');
}

// Render template gallery
function renderTemplates(templates) {
    const gallery = document.getElementById('templateGallery');
    gallery.innerHTML = '';
    
    if (templates.length === 0) {
        gallery.innerHTML = '<div class="no-templates">No templates found</div>';
        return;
    }
    
    templates.forEach(template => {
        const card = document.createElement('div');
        card.className = 'template-card';
        card.dataset.id = template.id || template.url;
        card.dataset.name = template.name.toLowerCase();
        
        const imageUrl = template.url || template.path;
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="${template.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/150x150?text=Error'">
            <div class="template-name">${template.name}</div>
            ${template.width && template.height ? `<div class="template-dims">${template.width}×${template.height}</div>` : ''}
        `;
        
        card.addEventListener('click', () => selectTemplate(template, card));
        gallery.appendChild(card);
    });
}

// Update source indicator
function updateTemplateSourceIndicator(source) {
    let indicator = document.getElementById('templateSourceIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'templateSourceIndicator';
        indicator.className = 'template-source-indicator';
        document.querySelector('.template-gallery')?.parentElement?.prepend(indicator);
    }
    
    if (source === 'api') {
        indicator.innerHTML = '🌐 Live templates from Imgflip';
        indicator.className = 'template-source-indicator api-source';
    } else {
        indicator.innerHTML = '📦 Offline mode - Local templates';
        indicator.className = 'template-source-indicator local-source';
    }
}

// Setup search functionality
function setupSearch() {
    const section = document.querySelector('.section:has(#templateGallery)');
    if (!section) return;
    
    // Create search input
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
        <input type="text" id="templateSearch" placeholder="🔍 Search templates..." class="search-input">
        <button id="refreshTemplates" class="refresh-btn" title="Refresh templates">🔄</button>
    `;
    
    section.insertBefore(searchContainer, document.getElementById('templateGallery'));
    
    // Search functionality
    const searchInput = document.getElementById('templateSearch');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.template-card');
        
        cards.forEach(card => {
            const name = card.dataset.name || '';
            card.style.display = name.includes(query) ? 'block' : 'none';
        });
    });
    
    // Refresh button
    document.getElementById('refreshTemplates')?.addEventListener('click', () => {
        if (isOnline) {
            showToast('🔄 Refreshing templates...');
            loadTemplates();
        } else {
            showToast('❌ Cannot refresh - you are offline');
        }
    });
}

// Old loadTemplateGallery function - replaced by loadTemplates/renderTemplates

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
    img.crossOrigin = 'anonymous'; // Enable CORS for external images
    
    img.onload = () => {
        currentImage = img;
        showEditor();
        generateMeme();
    };
    
    img.onerror = () => {
        showToast('❌ Failed to load image. Try another template or upload your own.');
    };
    
    // Use the appropriate image source
    img.src = template.url || template.path;
}

// Load template gallery - DEPRECATED, replaced by loadTemplates/renderTemplates

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

// Share meme to social media or copy link
async function shareMeme() {
    const canvas = document.getElementById('memeCanvas');
    
    // Get data URL for the meme
    const dataUrl = canvas.toDataURL('image/png');
    
    // Try Web Share API first (works on mobile and supported browsers)
    if (navigator.share) {
        try {
            // Convert data URL to blob for sharing
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], `meme-${Date.now()}.png`, { type: 'image/png' });
            
            await navigator.share({
                title: 'Check out my meme!',
                text: 'Created with Meme Generator Pro 💡',
                files: [file]
            });
            showToast('🔗 Meme shared!');
            return;
        } catch (err) {
            // User cancelled or sharing failed, fall through to manual share
            console.log('Web Share API failed:', err);
        }
    }
    
    // Fallback: Show share dialog with multiple options
    showShareDialog(dataUrl);
}

// Show custom share dialog
function showShareDialog(dataUrl) {
    // Remove existing dialog
    const existing = document.getElementById('shareDialog');
    if (existing) existing.remove();
    
    const dialog = document.createElement('div');
    dialog.id = 'shareDialog';
    dialog.className = 'share-dialog';
    dialog.innerHTML = `
        <div class="share-dialog-overlay" onclick="closeShareDialog()"></div>
        <div class="share-dialog-content">
            <h3>🔗 Share Your Meme</h3>
            <div class="share-options">
                <button class="share-btn twitter" onclick="shareToTwitter()">
                    <span>𝕏</span> Share on X/Twitter
                </button>
                <button class="share-btn facebook" onclick="shareToFacebook()">
                    <span>f</span> Share on Facebook
                </button>
                <button class="share-btn reddit" onclick="shareToReddit()">
                    <span>🤖</span> Share on Reddit
                </button>
                <button class="share-btn copy" onclick="copyMemeLink()">
                    <span>📋</span> Copy Image
                </button>
            </div>
            <div class="share-preview">
                <img src="${dataUrl}" alt="Meme preview">
            </div>
            <button class="close-btn" onclick="closeShareDialog()">Close</button>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Store current meme data URL for sharing functions
    window.currentMemeDataUrl = dataUrl;
}

function closeShareDialog() {
    const dialog = document.getElementById('shareDialog');
    if (dialog) {
        dialog.style.animation = 'fadeOut 0.2s ease';
        setTimeout(() => dialog.remove(), 200);
    }
}

function shareToTwitter() {
    const text = encodeURIComponent('Check out this meme I made! 💡');
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=400');
    showToast('🐦 Opening X/Twitter...');
    closeShareDialog();
}

function shareToFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
    showToast('📘 Opening Facebook...');
    closeShareDialog();
}

function shareToReddit() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent('Check out this meme I made!');
    window.open(`https://www.reddit.com/submit?url=${url}&title=${title}`, '_blank', 'width=800,height=600');
    showToast('🤖 Opening Reddit...');
    closeShareDialog();
}

async function copyMemeLink() {
    try {
        // Convert data URL to blob
        const response = await fetch(window.currentMemeDataUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
        ]);
        showToast('📋 Meme copied to clipboard!');
    } catch (err) {
        // Fallback to copying data URL
        await navigator.clipboard.writeText(window.currentMemeDataUrl);
        showToast('📋 Image URL copied!');
    }
    closeShareDialog();
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
    memeHistory.past = [];
    memeHistory.future = [];
    updateUndoRedoButtons();
}

// Setup Undo/Redo functionality
function setupUndoRedo() {
    // Add undo/redo buttons to controls
    const controls = document.querySelector('.controls');
    if (controls) {
        // Insert undo/redo buttons after the first button
        const undoBtn = document.createElement('button');
        undoBtn.id = 'undoBtn';
        undoBtn.className = 'secondary';
        undoBtn.innerHTML = '↩️ Undo';
        undoBtn.title = 'Ctrl+Z to undo';
        undoBtn.disabled = true;
        undoBtn.onclick = performUndo;

        const redoBtn = document.createElement('button');
        redoBtn.id = 'redoBtn';
        redoBtn.className = 'secondary';
        redoBtn.innerHTML = '↪️ Redo';
        redoBtn.title = 'Ctrl+Y or Ctrl+Shift+Z to redo';
        redoBtn.disabled = true;
        redoBtn.onclick = performRedo;

        // Insert before the Clear button
        const clearBtn = Array.from(controls.children).find(btn => btn.textContent.includes('Clear'));
        if (clearBtn) {
            controls.insertBefore(undoBtn, clearBtn);
            controls.insertBefore(redoBtn, clearBtn);
        } else {
            controls.appendChild(undoBtn);
            controls.appendChild(redoBtn);
        }
    }

    // Listen for input changes to save state
    const topText = document.getElementById('topText');
    const bottomText = document.getElementById('bottomText');
    const fontSize = document.getElementById('fontSize');
    const colorInputs = document.querySelectorAll('input[name="textColor"]');

    // Save initial state
    setTimeout(() => memeHistory.saveState(), 100);

    // Auto-save on changes (debounced)
    let saveTimer;
    const inputs = [topText, bottomText, fontSize, ...colorInputs];
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(() => memeHistory.saveState(), 300);
        });
        input.addEventListener('input', () => {
            if (input.type === 'range') {
                clearTimeout(saveTimer);
                saveTimer = setTimeout(() => memeHistory.saveState(), 500);
            }
        });
    });

    // Keyboard shortcuts for undo/redo
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                performUndo();
            } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
                e.preventDefault();
                performRedo();
            }
        }
    });
}

function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    if (undoBtn) {
        undoBtn.disabled = !memeHistory.canUndo();
        undoBtn.style.opacity = memeHistory.canUndo() ? '1' : '0.5';
    }
    if (redoBtn) {
        redoBtn.disabled = !memeHistory.canRedo();
        redoBtn.style.opacity = memeHistory.canRedo() ? '1' : '0.5';
    }
}

function performUndo() {
    const state = memeHistory.undo();
    if (state) {
        restoreState(state);
        showToast('↩️ Undo');
    }
}

function performRedo() {
    const state = memeHistory.redo();
    if (state) {
        restoreState(state);
        showToast('↪️ Redo');
    }
}

function restoreState(state) {
    document.getElementById('topText').value = state.topText;
    document.getElementById('bottomText').value = state.bottomText;
    document.getElementById('fontSize').value = state.fontSize;
    document.getElementById('fontSizeValue').textContent = state.fontSize + '%';
    
    const colorInput = document.querySelector(`input[name="textColor"][value="${state.textColor}"]`);
    if (colorInput) colorInput.checked = true;
    
    generateMeme();
}
