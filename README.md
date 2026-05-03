# BuildWithAI

A personal AI portfolio website for Sahil Sharma. The site presents applied AI projects, professional experience, education, skills, talks, and extracurricular work through a static frontend, with optional serverless chatbot components for resume and portfolio Q&A.

## Highlights

- Responsive single-page portfolio
- AI and data science project showcase
- Editable content files for profile sections
- Vanilla JavaScript navigation and interactions
- Chatbot and voice-call frontend modules
- AWS Lambda backend examples for RAG-style portfolio Q&A
- GitHub Pages friendly static deployment

## Tech Stack

Frontend:

- HTML5
- CSS3
- Vanilla JavaScript
- Font Awesome
- Google Fonts

Backend / optional chatbot pieces:

- AWS Lambda
- AWS SAM
- API Gateway
- Python
- Resume data preparation scripts

## Repository Structure

```text
.
├── index.html              # Main portfolio page
├── css/                    # Site, chatbot, and voice-call styles
├── js/                     # Main UI, content loader, chatbot, voice-call logic
├── content/                # Editable portfolio content
├── assets/images/          # Profile and site images
├── lambda/                 # Optional serverless chatbot backend
├── GITHUB_PAGES_DEPLOYMENT.md
├── CONTENT_EDITING_GUIDE.txt
└── QUICK_START.txt
```

## Run Locally

Because the site loads content with the Fetch API, run it through a local HTTP server instead of opening `index.html` directly:

```bash
git clone https://github.com/sss2107/BuildWithAI.git
cd BuildWithAI
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Updating Portfolio Content

Most profile text lives in the `content/` directory. Edit the relevant `.txt` file, keep the existing `[LABEL]` format, and refresh the local site.

Common files:

- `content/Introduction.txt`
- `content/AI_Projects.txt`
- `content/Education.txt`
- `content/Experience.txt`
- `content/Skills.txt`
- `content/ExtraCurriculars.txt`

For detailed editing guidance, see [CONTENT_EDITING_GUIDE.txt](CONTENT_EDITING_GUIDE.txt).

## Optional Chatbot Backend

The `lambda/` directory contains serverless backend assets for a resume RAG chatbot. See [lambda/README.md](lambda/README.md) for deployment details using AWS Lambda, API Gateway, and SAM.

## Deploying With GitHub Pages

1. Push changes to the `main` branch.
2. Open the repository settings on GitHub.
3. Enable GitHub Pages from the `main` branch.
4. Wait for GitHub Pages to publish the site.

See [GITHUB_PAGES_DEPLOYMENT.md](GITHUB_PAGES_DEPLOYMENT.md) for the fuller deployment guide.

## Customization

- Update colors, spacing, and responsive styles in `css/style.css`
- Update profile content in `content/`
- Replace profile imagery in `assets/images/`
- Configure chatbot endpoints in `js/chatbot.js`
- Configure voice-call interactions in `js/voicecall.js`

## Contact

- GitHub: [sss2107](https://github.com/sss2107)
- LinkedIn: [Sahil Sharma](https://www.linkedin.com/in/sahil-sharma-13540375/)

## License

Copyright 2025 Sahil Sharma. All rights reserved.
