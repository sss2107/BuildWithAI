// ==========================================
// CONTENT LOADER MODULE
// Loads content from text files dynamically
// ==========================================

const ContentLoader = {
    // Parse content file into key-value pairs
    parseContent: function(text) {
        const content = {};
        const lines = text.split('\n');
        let currentKey = null;
        let currentValue = '';
        
        for (let line of lines) {
            // Skip comments and empty lines
            if (line.trim().startsWith('#') || line.trim() === '') {
                continue;
            }
            
            // Check if line is a key (starts with [ and ends with ])
            if (line.trim().startsWith('[') && line.trim().endsWith(']')) {
                // Save previous key-value pair
                if (currentKey) {
                    content[currentKey] = currentValue.trim();
                }
                // Start new key
                currentKey = line.trim().slice(1, -1);
                currentValue = '';
            } else if (currentKey) {
                // Add to current value
                currentValue += line + '\n';
            }
        }
        
        // Save last key-value pair
        if (currentKey) {
            content[currentKey] = currentValue.trim();
        }
        
        return content;
    },
    
    // Load content from a file
    loadContentFile: async function(filename) {
        try {
            const response = await fetch(`content/${filename}`);
            if (!response.ok) {
                throw new Error(`Failed to load ${filename}`);
            }
            const text = await response.text();
            return this.parseContent(text);
        } catch (error) {
            console.error(`Error loading ${filename}:`, error);
            return null;
        }
    },
    
    // Load and populate Introduction section
    loadIntroduction: async function() {
        const content = await this.loadContentFile('Introduction.txt');
        if (!content) return;
        
        console.log('Loading Introduction section...');
        
        // Update title
        const titleEl = document.querySelector('#introduction .section-title');
        if (titleEl && content.TITLE) titleEl.textContent = content.TITLE;
        
        // Update subtitle
        const subtitleEl = document.querySelector('#introduction .intro-subtitle');
        if (subtitleEl && content.SUBTITLE) subtitleEl.textContent = content.SUBTITLE;
        
        // Update description paragraphs
        const descParagraphs = document.querySelectorAll('#introduction .intro-description');
        if (descParagraphs[0] && content.DESCRIPTION_PARAGRAPH_1) {
            descParagraphs[0].innerHTML = content.DESCRIPTION_PARAGRAPH_1.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        }
        if (descParagraphs[1] && content.DESCRIPTION_PARAGRAPH_2) {
            descParagraphs[1].innerHTML = content.DESCRIPTION_PARAGRAPH_2.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        }
        
        // Update location
        const locationEl = document.querySelector('#introduction .intro-location');
        if (locationEl && content.LOCATION) {
            locationEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${content.LOCATION}`;
        }
        
        // Update highlights
        if (content.HIGHLIGHTS) {
            const highlights = content.HIGHLIGHTS.split('\n').filter(h => h.trim());
            const highlightsContainer = document.querySelector('#introduction .intro-highlights');
            if (highlightsContainer && highlights.length > 0) {
                const icons = ['fa-graduation-cap', 'fa-briefcase', 'fa-star', 'fa-trophy', 'fa-phone'];
                highlightsContainer.innerHTML = highlights.map((highlight, index) => `
                    <div class="highlight-item">
                        <i class="fas ${icons[index] || 'fa-check'}"></i>
                        <span>${highlight.trim()}</span>
                    </div>
                `).join('');
            }
        }
        
        console.log('Introduction section loaded');
    },
    
    // Load and populate AI Projects section
    loadProjects: async function() {
        console.log('Attempting to load AI_Projects.txt...');
        const content = await this.loadContentFile('AI_Projects.txt');
        if (!content) {
            console.warn('Could not load AI_Projects.txt - keeping existing content');
            return;
        }
        
        console.log('Loading AI Projects section...');
        console.log('Content keys:', Object.keys(content));
        
        // Update section title and subtitle
        const sectionTitle = document.querySelector('#projects h2.section-title');
        if (sectionTitle && content.SECTION_TITLE) {
            sectionTitle.textContent = content.SECTION_TITLE;
        }

        const sectionSubtitle = document.querySelector('#projects .section-subtitle');
        if (sectionSubtitle && content.SECTION_SUBTITLE) {
            sectionSubtitle.textContent = content.SECTION_SUBTITLE;
        }

        // Load all projects (PROJECT_1 through PROJECT_10)
        const projectsGrid = document.querySelector('#projects .projects-grid');
        if (!projectsGrid) {
            console.error('Could not find .projects-grid element');
            return;
        }

        let projectsHTML = '';
        let projectCount = 0;
        
        for (let i = 1; i <= 10; i++) {
            const titleKey = `PROJECT_${i}_TITLE`;
            if (!content[titleKey]) {
                console.log(`No PROJECT_${i}_TITLE found, skipping...`);
                continue;
            }

            projectCount++;
            const orgKey = `PROJECT_${i}_ORG`;
            const descKey = `PROJECT_${i}_DESCRIPTION`;
            const achieveKey = `PROJECT_${i}_ACHIEVEMENTS`;
            const techKey = `PROJECT_${i}_TECH`;
            const badgeKey = `PROJECT_${i}_BADGE`;

            const achievements = content[achieveKey] ? content[achieveKey].split('\n').filter(a => a.trim()) : [];
            const technologies = content[techKey] ? content[techKey].split(',').map(t => t.trim()) : [];

            projectsHTML += `
                <div class="project-card" data-aos="fade-up" data-aos-delay="${(i-1) * 100}" style="display: block; visibility: visible; opacity: 1; min-height: 200px;">
                    <div class="project-header">
                        <i class="fas fa-robot project-icon"></i>
                        ${content[badgeKey] ? `<span class="project-badge">${content[badgeKey]}</span>` : ''}
                    </div>
                    <h3>${content[titleKey]}</h3>
                    <p class="project-org">${content[orgKey] || ''}</p>
                    <p class="project-description">${content[descKey] || ''}</p>
                    ${achievements.length > 0 ? `
                        <div class="project-achievements">
                            ${achievements.map(a => `<span>✓ ${a.trim()}</span>`).join('')}
                        </div>
                    ` : ''}
                    ${technologies.length > 0 ? `
                        <div class="project-tech">
                            ${technologies.map(tech => `<span>${tech}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }

        if (projectCount > 0) {
            console.log(`Loaded ${projectCount} projects, updating DOM...`);
            console.log('First project title:', content.PROJECT_1_TITLE);
            console.log('Projects HTML length:', projectsHTML.length);
            console.log('First 500 chars of HTML:', projectsHTML.substring(0, 500));
            projectsGrid.innerHTML = projectsHTML;
            console.log('DOM updated. Projects grid now has', projectsGrid.children.length, 'children');
            console.log('First child FULL HTML:', projectsGrid.children[0]?.outerHTML);
            
            // Refresh AOS (Animate On Scroll) for dynamically loaded content
            if (typeof AOS !== 'undefined') {
                console.log('Refreshing AOS animations...');
                AOS.refresh();
            }
        } else {
            console.warn('No projects found in content file');
        }

        // Add conference talks if present
        if (content.CONFERENCE_TALKS) {
            const talks = content.CONFERENCE_TALKS.split('\n').filter(t => t.trim() && !t.trim().match(/^\d+\./));
            if (talks.length > 0) {
                const talksSection = document.querySelector('#projects .conference-talks');
                if (talksSection) {
                    const talksList = talksSection.querySelector('.talks-list');
                    if (talksList) {
                        talksList.innerHTML = talks.map(talk => `<li>${talk.trim()}</li>`).join('');
                    }
                }
            }
        }
        
        console.log('AI Projects section loaded successfully');
    },
    
    // Initialize content loading
    init: async function() {
        console.log('ContentLoader: Initializing...');
        
        try {
            // Load all sections
            await this.loadIntroduction();
            await this.loadProjects();
            
            console.log('ContentLoader: All content loaded successfully');
        } catch (error) {
            console.error('ContentLoader: Error during initialization:', error);
        }
    }
};

// Load content when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ContentLoader.init());
} else {
    ContentLoader.init();
}
