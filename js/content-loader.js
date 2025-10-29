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
        
        // Update title
        const titleEl = document.querySelector('.intro-text h2');
        if (titleEl && content.TITLE) titleEl.textContent = content.TITLE;
        
        // Update subtitle
        const subtitleEl = document.querySelector('.intro-subtitle');
        if (subtitleEl && content.SUBTITLE) subtitleEl.textContent = content.SUBTITLE;
        
        // Update description paragraphs
        const descParagraphs = document.querySelectorAll('.intro-description');
        if (descParagraphs[0] && content.DESCRIPTION_PARAGRAPH_1) {
            descParagraphs[0].innerHTML = content.DESCRIPTION_PARAGRAPH_1.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        }
        if (descParagraphs[1] && content.DESCRIPTION_PARAGRAPH_2) {
            descParagraphs[1].innerHTML = content.DESCRIPTION_PARAGRAPH_2.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        }
        
        // Update location
        const locationEl = document.querySelector('.intro-location');
        if (locationEl && content.LOCATION) {
            locationEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${content.LOCATION}`;
        }
        
        // Update highlights
        if (content.HIGHLIGHTS) {
            const highlights = content.HIGHLIGHTS.split('\n').filter(h => h.trim());
            const highlightsContainer = document.querySelector('.intro-highlights');
            if (highlightsContainer && highlights.length > 0) {
                const icons = ['fa-graduation-cap', 'fa-briefcase', 'fa-robot', 'fa-trophy', 'fa-phone'];
                highlightsContainer.innerHTML = highlights.map((highlight, index) => `
                    <div class="highlight-item">
                        <i class="fas ${icons[index] || 'fa-check'}"></i>
                        <span>${highlight.trim()}</span>
                    </div>
                `).join('');
            }
        }
    },
    
    // Initialize content loading
    init: async function() {
        console.log('ContentLoader: Initializing...');
        
        // Load all sections
        await this.loadIntroduction();
        
        console.log('ContentLoader: All content loaded successfully');
    }
};

// Load content when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ContentLoader.init());
} else {
    ContentLoader.init();
}
