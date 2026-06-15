# 💡 Meme Generator Pro

A powerful, feature-rich meme generator with popular templates from Imgflip API and custom upload support.

**Live Demo:** [Try it now!](https://Agent-Lumi.github.io/meme-generator-pro)

## ✨ Features

### 🎨 Templates
- **50+ templates** fetched live from Imgflip API
- **Search** through templates by name
- **Offline mode** falls back to 12 local templates
- Auto-refresh capability
- Template dimensions displayed

### 📤 Custom Upload
- Upload your own images (JPG, PNG, GIF, WebP)
- Drag & drop support
- Maximum file size: 10MB

### ✏️ Editor
- **Dual text support**: Top and bottom text
- **Font size control**: Adjustable from 5% to 40%
- **Text colors**: White, Black, or Yellow with automatic contrasting outlines
- **Real-time preview**: See changes as you type
- **Optimized rendering**: Uses requestAnimationFrame for smooth performance

### 💾 Export Options
- **Download**: Save as PNG image
- **Copy to clipboard**: Quick sharing (Ctrl+C)
- **Share**: Share directly to Twitter/X, Facebook, Reddit or copy link
- **Keyboard shortcut**: Ctrl+S to download

### ⌨️ Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Download meme |
| `Ctrl+C` | Copy meme to clipboard |
| `Escape` | Clear and reset editor |
| `Ctrl+T` | Toggle dark/light theme |

### 🔗 Share Feature
- **Web Share API**: Native sharing on mobile devices
- **Social Buttons**: Quick share to Twitter/X, Facebook, Reddit
- **Copy Image**: Copy meme directly to clipboard
- **Preview**: See meme before sharing
- **Fallback**: Custom dialog for browsers without Web Share support

### 🌓 Theme Support
- **Dark Mode**: Sleek dark interface (default)
- **Light Mode**: Clean light theme option
- **Persistent**: Theme preference saved to localStorage
- **Quick Toggle**: Click the moon/sun button or use Ctrl+T

### 🌐 API Integration
- **Imgflip API**: Fetches 50 most popular meme templates
- **Live search**: Filter templates in real-time
- **Offline fallback**: Local templates when offline
- **CORS enabled**: External images work in canvas
- **Auto-detection**: Shows connection status

### 🎯 UI Improvements
- Clean, dark-themed interface
- Smooth animations and transitions
- Responsive design for mobile devices
- Toast notifications for user feedback
- Drag & drop visual feedback
- Template source indicator

### 🚀 PWA Support
- Works offline
- Installable as web app
- Service worker for caching

## 🛠️ Tech Stack
- Pure HTML5 Canvas for image generation
- Vanilla JavaScript with async/await
- Imgflip API for meme templates
- CSS Grid & Flexbox for layout
- GitHub Pages for hosting

## 📱 Usage

1. **Choose a template** from the gallery (50+ from API or 12 local) or **upload your own image**
   - Use the search box to find specific templates
   - Click 🔄 to refresh templates from API
2. **Enter text** in the top and/or bottom fields
3. **Adjust font size** and **select text color**
4. **Click "Update Preview"** to see your changes
5. **Download** or **copy** your meme!

## 🔄 Recent Updates

### v2.3 (Latest) - Share Functionality
- 🔗 Added share button with social media integration
- 📱 Web Share API support for mobile devices
- 💬 Quick share to Twitter/X, Facebook, and Reddit
- 💼 Copy image directly to clipboard from share dialog
- 🖼️ Preview meme before sharing
- 🎨 Share dialog styling for both dark and light modes

### v2.2 - API Integration
- 🌐 Added Imgflip API integration for 50+ live templates
- 🔍 Added template search functionality
- 🔄 Added refresh button for live updates
- ⚠️ Added offline/online status detection
- 📦 Local templates as fallback when offline
- 🌍 Cross-origin image support for external templates
- 📏 Display template dimensions
- 🟢 Visual indicator for API vs local templates

### v2.1
- ✅ Added dark/light theme toggle
- ✅ Theme preference persists with localStorage
- ✅ Added Ctrl+T keyboard shortcut for theme toggle
- ✅ Fixed text rendering in light mode

### v2.0
- ✅ Fixed duplicated code in HTML
- ✅ Added copy to clipboard functionality
- ✅ Added font size slider (5% - 40%)
- ✅ Added yellow text color option
- ✅ Added keyboard shortcuts (Ctrl+S, Ctrl+C, Escape)
- ✅ Improved text rendering with stroke outlines
- ✅ Added toast notifications
- ✅ Enhanced drag & drop UX
- ✅ Added file size validation (10MB max)
- ✅ Optimized canvas rendering with requestAnimationFrame
- ✅ Improved responsive design

## 📝 License
MIT - Made with 💡 by [Lumi](https://github.com/Agent-Lumi)
