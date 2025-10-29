# 🚀 BuildWithAI - Personal Portfolio Website

A modern, professional portfolio website showcasing AI and Data Science expertise with a stunning dark reddish theme. Built with pure HTML, CSS, and JavaScript - no frameworks needed!

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://yourusername.github.io/BuildWithAI)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/deployed-GitHub%20Pages-blue)](https://pages.github.com/)

## ✨ Features

- 🎨 **Modern Dark Reddish Theme**: Eye-catching color scheme with crimson accents
- 📱 **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- ⚡ **Smooth Animations**: Scroll-based animations and smooth transitions
- 🧭 **Interactive Navigation**: Fixed header with active section highlighting
- 📝 **Dynamic Content Loading**: Content loaded from `.txt` files for easy updates without touching code
- 🎯 **Six Main Sections**:
  - 👋 Introduction with professional photo
  - 🤖 AI Projects and Applied Research (9+ production projects)
  - 🎓 Education (NUS Master's & Bachelor's)
  - 💼 Experience (7 professional positions)
  - 🛠️ Skills (40+ technologies categorized by expertise)
  - 🏆 Extra Curriculars (Awards, conference talks, leadership)

## 🎬 Live Demo

**[View Live Website →](https://yourusername.github.io/BuildWithAI)**

## 📸 Screenshots

<div align="center">
  <img src="assets/images/screenshot-hero.png" alt="Hero Section" width="800px">
  <p><i>Hero section with dark reddish theme</i></p>
</div>

## 📁 Project Structure

```
BuildWithAI/
├── index.html              # Main HTML file
├── css/
│   └── style.css          # Dark reddish theme styles (~1500 lines)
├── js/
│   ├── main.js            # Interactive features & animations
│   └── content-loader.js  # Dynamic content loading system
├── content/               # Editable content files
│   ├── Introduction.txt
│   ├── AI_Projects.txt
│   ├── Education.txt
│   ├── Experience.txt
│   ├── Skills.txt
│   └── ExtraCurriculars.txt
├── assets/
│   └── images/
│       └── profile.jpg    # Profile photo
├── docs/                  # Documentation
│   ├── CONTENT_EDITING_GUIDE.txt
│   ├── CONTENT_SYSTEM_SUMMARY.txt
│   └── QUICK_START.txt
├── requirements.txt       # Python requirements (empty for static site)
└── PROJECT_REQUIREMENTS.txt  # Original project requirements
```

## 🎨 Design Specifications

### Color Palette
- Primary Dark: #1a0000
- Secondary Dark: #2d0a0a
- Accent Red: #dc143c
- Accent Red Hover: #ff4444
- Text Primary: #f5f5f5
- Text Secondary: #a0a0a0

### Typography
- Primary Font: Inter (headings)
- Secondary Font: Poppins (body text)

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Icons**: Font Awesome 6.4.0
- **Fonts**: Google Fonts (Inter, Poppins)
- **Deployment**: GitHub Pages
- **Version Control**: Git

## 🎯 Key Highlights

### Technical Implementation
- ✅ Pure HTML/CSS/JS - No frameworks or build tools needed
- ✅ **Dynamic content loading** from `.txt` files using Fetch API
- ✅ Modular content system with [LABEL] format parsing
- ✅ Smooth scroll navigation with active section highlighting
- ✅ Mobile-first responsive design
- ✅ CSS Grid & Flexbox layouts
- ✅ Intersection Observer API for scroll animations
- ✅ AOS (Animate On Scroll) library integration with dynamic content
- ✅ Optimized performance (<3s load time)

### Content Highlights
- 🤖 **9+ AI/ML Production Projects**: Including agentic chatbots, RAG systems, and local LLM agents
- 🏆 **Multiple Awards**: CEO Award, Best Research Paper, Hackathon Winner
- 🎤 **5+ Conference Talks**: AWS User Group, Asia Tech Summit, Google Developer Expert sessions
- 💼 **7 Professional Positions**: Singapore Airlines, Munich Re, X0PA AI, EY, KPMG, PayU
- 🎓 **Google Developer Expert** in Generative AI
- 📊 **40+ Technologies**: PyTorch, TensorFlow, Langchain, AWS, and more

## 🚀 Quick Start

### Option 1: View on GitHub Pages (After Deployment)
Simply visit: `https://yourusername.github.io/BuildWithAI`

### Option 2: Local Development

**Clone the repository:**
```bash
git clone https://github.com/yourusername/BuildWithAI.git
cd BuildWithAI
```

**Run locally using Python:**
```bash
python3 -m http.server 8000
```
Then open: http://localhost:8000

**Or simply open the HTML file:**
```bash
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

## 🌐 Deploy to GitHub Pages

### Step-by-Step Deployment Guide

1. **Create a new GitHub repository:**
   - Go to https://github.com/new
   - Repository name: `BuildWithAI` (or your preferred name)
   - Select "Public"
   - Do NOT initialize with README (we already have one)
   - Click "Create repository"

2. **Push your code to GitHub:**
   ```bash
   cd /Users/sahil_sharma/Downloads/BuildWithAI
   git init
   git add .
   git commit -m "Initial commit: Portfolio website"
   git branch -M main
   git remote add origin https://github.com/yourusername/BuildWithAI.git
   git push -u origin main
   ```

3. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click "Settings" tab
   - Scroll to "Pages" section (left sidebar)
   - Under "Source", select "main" branch
   - Click "Save"
   - Your site will be published at: `https://yourusername.github.io/BuildWithAI`

4. **Wait for deployment:**
   - GitHub Pages typically takes 1-2 minutes to deploy
   - You'll see a green checkmark when ready
   - Visit your live site!

5. **Optional: Add custom domain:**
   - In the "Pages" settings, add your custom domain: `buildwithai.com`
   - Update your DNS settings:
     ```
     Type: CNAME
     Name: www
     Value: yourusername.github.io
     ```

## 📝 Dynamic Content Loading System

This website features a **powerful dynamic content loading system** that separates content from code. Instead of hardcoding text in HTML, content is loaded from `.txt` files, making updates incredibly easy!

### 🎯 Why Dynamic Loading?

- ✅ **No Code Editing Required**: Update content without touching HTML/CSS/JS
- ✅ **Version Control Friendly**: Text files are easy to track in Git
- ✅ **Maintainability**: Non-technical users can edit content safely
- ✅ **Consistency**: Standardized format across all sections
- ✅ **Quick Updates**: Edit → Commit → Push → Auto-deploy in 2 minutes

### 📂 Sections Using Dynamic Loading

Currently, these sections dynamically load content from `.txt` files:
- ✅ **Introduction** - Hero section (title, subtitle, descriptions, highlights)
- ✅ **AI Projects** - All 9 projects with full details

*Note: Education, Experience, Skills, and Extra Curriculars sections are still hardcoded in HTML but can be converted to dynamic loading if needed.*

### 📋 Content File Format

Content files use a simple `[LABEL]` format. Here's an example:

**content/Introduction.txt**
```txt
[TITLE]
Hi, I'm Sahil Sharma

[SUBTITLE]
AI & GenAI Specialist

[DESCRIPTION_PARAGRAPH_1]
I'm a Senior Data Scientist at Singapore Airlines...

[DESCRIPTION_PARAGRAPH_2]
With a proven track record in deploying AI solutions...

[LOCATION]
Singapore

[HIGHLIGHTS]
Google Developer Expert (GDE) in AI/ML
Senior Data Scientist at Singapore Airlines
7+ Years in AI/ML Engineering
Master's in Data Science from NUS
40+ Technologies Mastered
```

**content/AI_Projects.txt**
```txt
[PROJECT_1_TITLE]
Curie - HR Policy Chatbot (Agentic Framework)

[PROJECT_1_ORG]
Singapore Airlines | 2022 - Present

[PROJECT_1_DESCRIPTION]
Designed and developed Curie, an employee-facing HR chatbot...

[PROJECT_1_ACHIEVEMENTS]
Intelligent policy routing across 7+ HR domains
Reduced HR query response time by 80%
24/7 automated policy assistance for employees

[PROJECT_1_TECH]
Langgraph, OpenAI, AWS, Agent Framework, RAG

[PROJECT_1_BADGE]
Production

[PROJECT_2_TITLE]
...
```

### 🔧 How to Update Content

**Step 1: Edit the `.txt` file**
```bash
# Open the file you want to edit
nano content/Introduction.txt
# or
nano content/AI_Projects.txt

# Make your changes following the [LABEL] format
# Save and exit
```

**Step 2: Commit your changes**
```bash
git add content/
git commit -m "Update introduction section"
```

**Step 3: Push to GitHub**
```bash
git push origin main
```

**Step 4: Wait for auto-deployment**
- GitHub Pages will automatically rebuild your site in 1-2 minutes
- Visit https://yourusername.github.io/BuildWithAI to see your changes live!

### 🚨 Important: Local Development Requirements

**You MUST use an HTTP server for local testing** due to browser CORS restrictions on the `fetch()` API:

```bash
# Start a local server (choose one)
python3 -m http.server 8001      # Python 3
python -m SimpleHTTPServer 8001  # Python 2

# Then open in browser
open http://localhost:8001
```

❌ **Don't use**: `file:///path/to/index.html` - Dynamic loading will fail!  
✅ **Use**: `http://localhost:8001` - Dynamic loading works perfectly!

### 🛠️ Technical Details

The dynamic loading system is powered by `js/content-loader.js`:

- **parseContent()**: Parses `[LABEL]\nvalue` format into JavaScript objects
- **loadContentFile()**: Fetches content files via Fetch API
- **loadIntroduction()**: Updates hero section with dynamic content
- **loadProjects()**: Generates all 9 project cards dynamically
- **AOS.refresh()**: Reinitializes animations after DOM updates
- **Inline styles**: Ensures visibility of dynamically loaded content

### 🐛 Troubleshooting Dynamic Content

**Problem**: Content not loading locally  
**Solution**: Make sure you're using `http://localhost:8001`, not `file://`

**Problem**: Content loads but not visible  
**Solution**: Already fixed! The system includes `AOS.refresh()` and inline visibility styles

**Problem**: New content not showing on live site  
**Solution**: Wait 2 minutes for GitHub Pages to rebuild, clear browser cache (Ctrl+Shift+R)

**Problem**: Console shows "Failed to load content"  
**Solution**: Check that `.txt` files exist in `content/` folder with correct filenames

### 📊 Content File Reference

| File | Section | Status |
|------|---------|--------|
| `content/Introduction.txt` | Hero/Intro | ✅ Dynamic |
| `content/AI_Projects.txt` | Projects Grid | ✅ Dynamic |
| `content/Education.txt` | Education Timeline | ⚪ Hardcoded |
| `content/Experience.txt` | Work Experience | ⚪ Hardcoded |
| `content/Skills.txt` | Skills Grid | ⚪ Hardcoded |
| `content/ExtraCurriculars.txt` | Awards/Talks | ⚪ Hardcoded |



## 🎨 Customization

### Update Content - The Easy Way! 📝

**For sections with dynamic loading (Introduction, AI Projects):**
```bash
# Simply edit the .txt files
nano content/Introduction.txt
nano content/AI_Projects.txt

# Commit and push
git add content/
git commit -m "Update content"
git push origin main

# GitHub Pages auto-deploys in 1-2 minutes!
```

**For other sections (Education, Experience, Skills, Extra Curriculars):**
```bash
# Edit the main HTML file
nano index.html
```

See the **📝 Dynamic Content Loading System** section above for detailed instructions.

### Change Colors

Edit CSS variables in `css/style.css`:
```css
:root {
    --primary-dark: #1a0000;    /* Main background */
    --secondary-dark: #2d0a0a;  /* Card backgrounds */
    --accent-red: #dc143c;      /* Primary accent */
    --accent-hover: #ff4444;    /* Hover effects */
    /* ... customize all colors */
}
```

### Add/Remove Sections

1. Add HTML section in `index.html`
2. Add navigation link in header
3. Style in `css/style.css`
4. Update JavaScript navigation in `js/main.js`

## 📱 Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 Content Management

This website uses a unique content management system where text content is stored in separate `.txt` files for easy editing without touching HTML/CSS/JS.

### Content Files:
- `content/Introduction.txt` - Hero section text
- `content/AI_Projects.txt` - All project descriptions
- `content/Education.txt` - Education history
- `content/Experience.txt` - Work experience
- `content/Skills.txt` - Technical skills
- `content/ExtraCurriculars.txt` - Awards, talks, leadership

### Format Example:
```txt
[TITLE]
Hi, I'm Sahil Sharma

[SUBTITLE]
Senior Data Scientist | AI & GenAI Specialist

[DESCRIPTION_1]
I'm a Senior Data Scientist at Singapore Airlines...
```

See `docs/CONTENT_EDITING_GUIDE.txt` for complete editing instructions.

## 📱 Browser Compatibility

✅ Chrome (Recommended)  
✅ Firefox  
✅ Safari  
✅ Edge  
✅ Mobile browsers (iOS Safari, Chrome Mobile)

*Note: Dynamic content loading requires modern browsers with Fetch API support (all browsers since 2015)*

## 🚀 Performance

- ⚡ Page Load: < 3 seconds
- 📊 Lighthouse Score: 90+
- ♿ WCAG 2.1 AA Accessibility
- 📱 Mobile-First Responsive Design

## 🤝 Contributing

This is a personal portfolio, but suggestions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

**Sahil Sharma**  
Senior Data Scientist | AI & GenAI Specialist | Google Developer Expert

- 📧 Email: sahil21@u.nus.edu
- 📱 Phone: +65 93952564
- 💼 LinkedIn: [linkedin.com/in/sahil-sharma-13540375](https://www.linkedin.com/in/sahil-sharma-13540375/)
- 🐙 GitHub: [github.com/sss2107](https://github.com/sss2107)
- 📍 Location: Singapore

## 📄 License

© 2025 Sahil Sharma. All rights reserved.

---

<div align="center">
  <p>Built with ❤️ and passion for AI innovation</p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div>

````

## 🐛 Troubleshooting

### Images Not Loading
- Check file paths are correct
- Ensure images are in `assets/images/` folder
- Verify image file extensions match HTML references

### Styles Not Applied
- Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R)
- Check CSS file path in HTML
- Verify CSS syntax (no errors in dev tools)

### JavaScript Not Working
- Open browser console (F12) to check for errors
- Ensure `main.js` is loaded
- Check for JavaScript syntax errors

## 📧 Contact

**Sahil Sharma**
- Email: sahil21@u.nus.edu
- Phone: +65 93952564
- LinkedIn: https://www.linkedin.com/in/sahil-sharma-13540375/
- Location: Singapore

## 📄 License

© 2025 Sahil Sharma. All rights reserved.

---

Built with ❤️ and passion for AI innovation
