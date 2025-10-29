// ==========================================
// BUILDWITHAI - MAIN JAVASCRIPT
// Author: Sahil Sharma
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all features
    initNavigation();
    initScrollEffects();
    initMobileMenu();
    initAnimations();
    initScrollTopButton();
});

// ==========================================
// NAVIGATION
// ==========================================
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    // Add smooth scroll behavior
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerOffset = 80;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const navMenu = document.getElementById('navMenu');
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                }
            }
        });
    });
    
    // Update active navigation on scroll
    window.addEventListener('scroll', function() {
        let current = '';
        const scrollPosition = window.pageYOffset + 150;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
        
        // Header background on scroll
        const header = document.getElementById('header');
        if (window.pageYOffset > 100) {
            header.style.background = 'rgba(26, 0, 0, 0.98)';
            header.style.boxShadow = '0 2px 30px rgba(220, 20, 60, 0.4)';
        } else {
            header.style.background = 'rgba(26, 0, 0, 0.95)';
            header.style.boxShadow = '0 2px 20px rgba(220, 20, 60, 0.3)';
        }
    });
}

// ==========================================
// MOBILE MENU
// ==========================================
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animate hamburger icon
            const icon = this.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.navbar')) {
                navMenu.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
}

// ==========================================
// SCROLL EFFECTS & ANIMATIONS
// ==========================================
function initScrollEffects() {
    // Animate skill bars on scroll
    const skillBars = document.querySelectorAll('.skill-bar');
    
    const animateSkills = () => {
        skillBars.forEach(bar => {
            const barPosition = bar.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (barPosition < screenPosition) {
                const skillLevel = bar.querySelector('.skill-level');
                if (skillLevel && !skillLevel.classList.contains('animated')) {
                    skillLevel.classList.add('animated');
                    // Trigger width animation
                    const width = skillLevel.style.width;
                    skillLevel.style.width = '0';
                    setTimeout(() => {
                        skillLevel.style.width = width;
                    }, 100);
                }
            }
        });
    };
    
    window.addEventListener('scroll', animateSkills);
    animateSkills(); // Run once on load
}

// ==========================================
// SCROLL ANIMATIONS (AOS-like)
// ==========================================
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
                
                // Add stagger delay to children if they exist
                const children = entry.target.querySelectorAll('[data-aos-delay]');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('aos-animate');
                    }, parseInt(child.getAttribute('data-aos-delay')) || index * 100);
                });
            }
        });
    }, observerOptions);
    
    // Observe all elements with data-aos attribute
    const animatedElements = document.querySelectorAll('[data-aos]');
    animatedElements.forEach(el => observer.observe(el));
}

// ==========================================
// SCROLL TO TOP BUTTON
// ==========================================
function initScrollTopButton() {
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    
    if (scrollTopBtn) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });
        
        // Scroll to top when clicked
        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ==========================================
// PROJECT CARD HOVER EFFECTS
// ==========================================
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// ==========================================
// TYPING EFFECT FOR INTRO (Optional)
// ==========================================
function typingEffect() {
    const subtitle = document.querySelector('.intro-subtitle');
    if (!subtitle) return;
    
    const text = subtitle.textContent;
    subtitle.textContent = '';
    let index = 0;
    
    function type() {
        if (index < text.length) {
            subtitle.textContent += text.charAt(index);
            index++;
            setTimeout(type, 50);
        }
    }
    
    // Uncomment to enable typing effect
    // setTimeout(type, 500);
}

// ==========================================
// PARALLAX EFFECT (Subtle)
// ==========================================
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.intro-image');
    
    parallaxElements.forEach(element => {
        const speed = 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// ==========================================
// THEME TOGGLE (Optional - Future Enhancement)
// ==========================================
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// ==========================================
// PRELOADER (Optional)
// ==========================================
window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }, 1000);
    }
});

// ==========================================
// PERFORMANCE OPTIMIZATION
// ==========================================
// Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ==========================================
// CONSOLE EASTER EGG
// ==========================================
console.log('%c👋 Hello, fellow developer!', 'color: #dc143c; font-size: 20px; font-weight: bold;');
console.log('%cBuilt with ❤️ by Sahil Sharma', 'color: #ff6b6b; font-size: 14px;');
console.log('%cInterested in AI & Data Science? Let\'s connect!', 'color: #a0a0a0; font-size: 12px;');
console.log('%csahil21@u.nus.edu', 'color: #dc143c; font-size: 12px; font-weight: bold;');

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Apply throttle to scroll events for better performance
const throttledScroll = throttle(() => {
    // Scroll-based operations
}, 100);

window.addEventListener('scroll', throttledScroll);

// ==========================================
// ANALYTICS (Optional - Add Google Analytics)
// ==========================================
function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
}

// Track navigation clicks
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
        trackEvent('Navigation', 'Click', this.textContent);
    });
});

// Track social link clicks
document.querySelectorAll('.social-links a').forEach(link => {
    link.addEventListener('click', function() {
        trackEvent('Social', 'Click', this.getAttribute('title'));
    });
});

// ==========================================
// ACCESSIBILITY IMPROVEMENTS
// ==========================================

// Keyboard navigation for cards
document.querySelectorAll('.project-card, .award-card, .skill-category').forEach(card => {
    card.setAttribute('tabindex', '0');
    
    card.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            this.click();
        }
    });
});

// Focus visible for better accessibility
document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-navigation');
});

// ==========================================
// CONTACT FORM VALIDATION (If Added)
// ==========================================
function validateContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = form.querySelector('#name').value.trim();
        const email = form.querySelector('#email').value.trim();
        const message = form.querySelector('#message').value.trim();
        
        // Basic validation
        if (!name || !email || !message) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Submit form (implement your own submission logic)
        showNotification('Message sent successfully!', 'success');
        form.reset();
    });
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==========================================
// PRINT STYLES HELPER
// ==========================================
window.addEventListener('beforeprint', function() {
    document.body.classList.add('printing');
});

window.addEventListener('afterprint', function() {
    document.body.classList.remove('printing');
});

// ==========================================
// SMOOTH REVEAL ON PAGE LOAD
// ==========================================
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});
