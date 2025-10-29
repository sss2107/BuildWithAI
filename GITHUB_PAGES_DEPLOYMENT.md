================================================================================================
GITHUB PAGES DEPLOYMENT GUIDE
Complete Step-by-Step Instructions for Hosting Your Portfolio on GitHub Pages
================================================================================================

WHAT IS GITHUB PAGES?
================================================================================================
GitHub Pages is a free static site hosting service that takes HTML, CSS, and JavaScript files 
directly from a GitHub repository and publishes them as a website.

Benefits:
✅ 100% FREE - No cost, no ads
✅ Fast & Reliable - Hosted on GitHub's CDN
✅ Custom Domain Support - Use buildwithai.com
✅ HTTPS Included - Free SSL certificate
✅ Easy Updates - Just push to GitHub to update site
✅ Version Control - Full git history of your website


PREREQUISITES
================================================================================================
Before you start, make sure you have:

1. GitHub Account
   - If you don't have one, create it at: https://github.com/join
   - Choose a memorable username (e.g., sahilsharma, sss2107)

2. Git Installed on Your Mac
   - Check if you have git: Open Terminal and type: git --version
   - If not installed, install from: https://git-scm.com/download/mac
   - Or install via Homebrew: brew install git

3. Your Website Files Ready
   - You already have them at: /Users/sahil_sharma/Downloads/BuildWithAI/
   - All files are ready to deploy!


STEP-BY-STEP DEPLOYMENT PROCESS
================================================================================================

STEP 1: CREATE A NEW GITHUB REPOSITORY
---------------------------------------------------
1. Open your web browser and go to: https://github.com/new

2. Fill in the repository details:
   
   Repository Name: BuildWithAI
   (Or choose: portfolio, personal-website, resume-site, etc.)
   
   Description: "My professional portfolio website showcasing AI & Data Science projects"
   
   Visibility: PUBLIC (Required for free GitHub Pages)
   ⚠️ Important: Must be public, not private
   
   Initialize repository:
   ❌ DO NOT check "Add a README file" (we already have one)
   ❌ DO NOT add .gitignore (we already have one)
   ❌ DO NOT choose a license yet
   
3. Click the green "Create repository" button

4. You'll see a page with setup instructions. Keep this page open!


STEP 2: PREPARE YOUR LOCAL REPOSITORY
---------------------------------------------------
Open Terminal (Applications → Utilities → Terminal) and run these commands:

1. Navigate to your project folder:
   
   cd /Users/sahil_sharma/Downloads/BuildWithAI
   

2. Initialize git repository (if not already done):
   
   git init
   
   You should see: "Initialized empty Git repository"

3. Add all files to staging:
   
   git add .
   
   This prepares all your files for the first commit

4. Create your first commit:
   
   git commit -m "Initial commit: Portfolio website with dark reddish theme"
   
   You should see a summary of files added

5. Rename the default branch to 'main' (GitHub's default):
   
   git branch -M main
   


STEP 3: CONNECT TO GITHUB AND PUSH
---------------------------------------------------
⚠️ IMPORTANT: Replace 'yourusername' with your actual GitHub username in the commands below!

1. Add GitHub as remote repository:
   
   git remote add origin https://github.com/yourusername/BuildWithAI.git
   
   Example: If your username is 'sahilsharma', use:
   git remote add origin https://github.com/sahilsharma/BuildWithAI.git

2. Push your code to GitHub:
   
   git push -u origin main
   
   You may be prompted to enter your GitHub username and password.
   
   ⚠️ If using password: GitHub no longer accepts password authentication
   Instead, you need a Personal Access Token (PAT):
   
   How to create a PAT:
   a. Go to: https://github.com/settings/tokens
   b. Click "Generate new token" → "Generate new token (classic)"
   c. Name it: "BuildWithAI Deploy"
   d. Select expiration: 90 days (or your preference)
   e. Check scopes: ✅ repo (all)
   f. Click "Generate token"
   g. COPY THE TOKEN IMMEDIATELY (you won't see it again!)
   h. Use this token as your password when pushing

3. Verify upload:
   - Refresh your GitHub repository page
   - You should see all your files uploaded!


STEP 4: ENABLE GITHUB PAGES
---------------------------------------------------
1. Go to your repository on GitHub:
   https://github.com/yourusername/BuildWithAI

2. Click the "Settings" tab (top menu, far right with ⚙️ icon)

3. In the left sidebar, scroll down and click "Pages"
   (Under "Code and automation" section)

4. Under "Build and deployment":
   
   Source: Select "Deploy from a branch"
   
   Branch: 
   - Select "main" from the dropdown
   - Select "/ (root)" for the folder
   
   Click "Save"

5. You'll see a message: "GitHub Pages source saved"

6. Wait 1-2 minutes for deployment (GitHub needs to build your site)

7. Refresh the page and you'll see a success message:
   "Your site is live at https://yourusername.github.io/BuildWithAI/"


STEP 5: ACCESS YOUR LIVE WEBSITE
---------------------------------------------------
Your website is now live at:

https://yourusername.github.io/BuildWithAI/

Replace 'yourusername' with your actual GitHub username.

Example URLs:
- If username is 'sahilsharma': https://sahilsharma.github.io/BuildWithAI/
- If username is 'sss2107': https://sss2107.github.io/BuildWithAI/

🎉 Congratulations! Your portfolio is live on the internet!


STEP 6 (OPTIONAL): ADD CUSTOM DOMAIN - buildwithai.com
================================================================================================

If you want to use buildwithai.com instead of github.io URL:

PART A: PURCHASE DOMAIN
---------------------------------------------------
1. Buy domain from a registrar:
   - Google Domains (domains.google)
   - Namecheap (namecheap.com)
   - GoDaddy (godaddy.com)
   - Cloudflare (cloudflare.com)

2. Cost: Usually $10-15 per year


PART B: CONFIGURE DNS SETTINGS
---------------------------------------------------
In your domain registrar's DNS management, add these records:

For apex domain (buildwithai.com):
   Type: A
   Name: @ (or leave blank)
   Value: 185.199.108.153
   TTL: 3600

   Add 3 more A records with these IPs:
   185.199.109.153
   185.199.110.153
   185.199.111.153

For www subdomain (www.buildwithai.com):
   Type: CNAME
   Name: www
   Value: yourusername.github.io
   TTL: 3600


PART C: CONFIGURE GITHUB PAGES FOR CUSTOM DOMAIN
---------------------------------------------------
1. Go to your GitHub repository

2. Settings → Pages

3. Under "Custom domain":
   - Enter: buildwithai.com
   - Click "Save"

4. Wait for DNS check (can take up to 24 hours, usually 1-2 hours)

5. Once verified, check "Enforce HTTPS"

6. Your site will be available at: https://buildwithai.com


UPDATING YOUR WEBSITE
================================================================================================

After deployment, whenever you want to update your website:

METHOD 1: UPDATE CONTENT FILES
---------------------------------------------------
1. Edit the content files locally:
   - content/Introduction.txt
   - content/AI_Projects.txt
   - content/Skills.txt
   - etc.

2. Save your changes

3. Push to GitHub:
   cd /Users/sahil_sharma/Downloads/BuildWithAI
   git add .
   git commit -m "Update project descriptions"
   git push origin main

4. GitHub Pages will automatically update your site (takes 1-2 minutes)


METHOD 2: EDIT DIRECTLY ON GITHUB (QUICK EDITS)
---------------------------------------------------
1. Go to your repository on GitHub

2. Navigate to the file you want to edit

3. Click the pencil icon (✏️) to edit

4. Make your changes

5. Scroll down, add commit message, click "Commit changes"

6. Your site updates automatically!


TROUBLESHOOTING
================================================================================================

ISSUE 1: "Site not found" or 404 error
---------------------------------------------------
Solution:
- Wait 2-3 minutes after enabling Pages
- Make sure index.html is in the root folder (not in a subfolder)
- Check that repository is PUBLIC
- Verify Pages is enabled in Settings


ISSUE 2: CSS/Images not loading
---------------------------------------------------
Solution:
- Check that all paths are relative (already done ✅)
- Verify css/style.css exists
- Verify assets/images/profile.jpg exists
- Check browser console (F12) for errors
- Clear browser cache (Cmd+Shift+R)


ISSUE 3: Git push asks for username/password repeatedly
---------------------------------------------------
Solution:
- Use SSH instead of HTTPS
- Or cache credentials:
  git config --global credential.helper osxkeychain


ISSUE 4: Custom domain not working
---------------------------------------------------
Solution:
- Wait up to 24 hours for DNS propagation
- Verify DNS records are correct (use: https://dnschecker.org)
- Make sure you added CNAME file in repository
- Check that domain is properly configured in GitHub Pages settings


ISSUE 5: Changes not showing on live site
---------------------------------------------------
Solution:
- Wait 1-2 minutes for GitHub Pages to rebuild
- Check if git push was successful
- Clear browser cache (Cmd+Shift+R)
- Try in incognito/private mode
- Check GitHub Actions tab for build status


VERIFYING YOUR DEPLOYMENT
================================================================================================

Checklist after deployment:
□ Website loads at yourusername.github.io/BuildWithAI
□ All sections visible and working
□ Navigation works (smooth scrolling)
□ Images load correctly
□ CSS styles applied (dark reddish theme visible)
□ JavaScript animations working
□ Mobile responsive (test on phone or resize browser)
□ All links work (LinkedIn, email, etc.)
□ Footer displays correctly
□ No console errors (F12 → Console tab)


USEFUL GIT COMMANDS
================================================================================================

Check status of your files:
git status

View commit history:
git log --oneline

Undo last commit (keep changes):
git reset --soft HEAD~1

View remote repository:
git remote -v

Pull latest changes from GitHub:
git pull origin main

Create a new branch:
git checkout -b feature-name

View differences:
git diff


MAINTENANCE TIPS
================================================================================================

1. Regular Updates:
   - Update your projects regularly
   - Add new achievements
   - Keep skills section current
   - Update profile photo if needed

2. Content Backup:
   - GitHub already backs up everything
   - Keep local copy too
   - Consider exporting content files periodically

3. Performance Monitoring:
   - Use Google Lighthouse (in Chrome DevTools)
   - Check loading speed
   - Monitor on different devices

4. Analytics (Optional):
   - Add Google Analytics to track visitors
   - See which sections people view most
   - Understand your audience

5. Regular Commits:
   - Commit often with meaningful messages
   - Example: "Add new AI project - Healthcare chatbot"
   - Example: "Update skills section with new frameworks"


QUICK REFERENCE - COMMON TASKS
================================================================================================

Add a new project:
1. Edit content/AI_Projects.txt
2. Add new project with [PROJECT_X_TITLE], [PROJECT_X_DESC], etc.
3. Save file
4. In Terminal:
   cd /Users/sahil_sharma/Downloads/BuildWithAI
   git add content/AI_Projects.txt
   git commit -m "Add new project: [Project Name]"
   git push origin main

Update your photo:
1. Replace assets/images/profile.jpg with new photo
2. Keep same filename or update index.html
3. In Terminal:
   git add assets/images/profile.jpg
   git commit -m "Update profile photo"
   git push origin main

Change color theme:
1. Edit css/style.css
2. Modify :root variables
3. In Terminal:
   git add css/style.css
   git commit -m "Update color theme"
   git push origin main


NEED HELP?
================================================================================================

GitHub Pages Documentation:
https://docs.github.com/en/pages

GitHub Support:
https://support.github.com

Git Documentation:
https://git-scm.com/doc

Community Help:
- Stack Overflow: https://stackoverflow.com/questions/tagged/github-pages
- GitHub Community: https://github.community/


SUCCESS CHECKLIST
================================================================================================

Before considering deployment complete:

□ Repository created on GitHub
□ All files pushed to GitHub
□ GitHub Pages enabled in Settings
□ Website accessible at yourusername.github.io/BuildWithAI
□ All sections load correctly
□ Navigation works properly
□ Images display correctly
□ CSS theme applied (dark reddish)
□ Mobile responsive working
□ All links functional
□ No console errors
□ Social media links updated (GitHub, Twitter)
□ README.md updated with your username
□ Custom domain configured (if applicable)

🎉 Once all checked, you're done! Share your portfolio with the world!


SHARING YOUR PORTFOLIO
================================================================================================

Add to your profiles:
✅ LinkedIn: Update "Featured" section with your website link
✅ GitHub: Add website URL to your GitHub profile
✅ Twitter/X: Add to bio
✅ Email signature: Include your portfolio link
✅ Resume: Add website URL at the top
✅ Business cards: Include QR code to your site

Share on social media:
"🎉 Excited to share my new portfolio website! Check out my AI/ML projects, experience, 
and technical talks. Built with HTML/CSS/JS and hosted on GitHub Pages. 
Link: https://yourusername.github.io/BuildWithAI"


================================================================================================
END OF DEPLOYMENT GUIDE
================================================================================================

Good luck with your deployment! Your portfolio looks amazing! 🚀

If you encounter any issues, refer to the Troubleshooting section above.
