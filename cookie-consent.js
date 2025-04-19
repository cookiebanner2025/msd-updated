/**
 * Complete GDPR Cookie Consent Solution
 * - Auto-detects and categorizes cookies
 * - Floating cookie settings button on left side
 * - Detailed cookie information
 * - Full compliance with Google, GA4, Facebook, Consent Mode v2
 */

// Initialize dataLayer for Google Tag Manager
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }

// Set default consent (deny all except security)
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'analytics_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'personalization_storage': 'denied',
  'functionality_storage': 'denied',
  'security_storage': 'granted'
});

// Extended cookie database with detailed descriptions
const cookieDatabase = {
    // Google Analytics/GA4
    '_ga': {
        category: 'analytics',
        duration: '2 years',
        description: 'Google Analytics cookie used to distinguish users'
    },
    '_gid': {
        category: 'analytics',
        duration: '24 hours',
        description: 'Google Analytics cookie used to distinguish users'
    },
    '_gat': {
        category: 'analytics',
        duration: '1 minute',
        description: 'Google Analytics cookie used to throttle request rate'
    },
    '_ga_': {
        category: 'analytics',
        duration: '2 years',
        description: 'Google Analytics 4 cookie used to persist session state'
    },
    
    // Facebook Pixel
    '_fbp': {
        category: 'advertising',
        duration: '3 months',
        description: 'Facebook Pixel cookie used to track conversions'
    },
    'fr': {
        category: 'advertising',
        duration: '3 months',
        description: 'Facebook cookie used to deliver targeted advertising'
    },
    
    // Functional cookies
    'wordpress_': {
        category: 'functional',
        duration: 'Session',
        description: 'WordPress authentication cookie'
    },
    'wp-settings': {
        category: 'functional',
        duration: '1 year',
        description: 'WordPress user preferences cookie'
    },
    'PHPSESSID': {
        category: 'functional',
        duration: 'Session',
        description: 'PHP session cookie essential for website functionality'
    },
    
    // Advertising cookies
    '_gcl_au': {
        category: 'advertising',
        duration: '3 months',
        description: 'Google Ads conversion tracking cookie'
    },
    'IDE': {
        category: 'advertising',
        duration: '1 year',
        description: 'Google DoubleClick advertising cookie'
    },
    'NID': {
        category: 'advertising',
        duration: '6 months',
        description: 'Google advertising cookie used for user tracking'
    }
};

// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    // Scan and categorize existing cookies
    const detectedCookies = scanAndCategorizeCookies();
    
    // Inject HTML structure with detected cookies
    injectConsentHTML(detectedCookies);
    
    // Initialize functionality
    initializeCookieConsent(detectedCookies);
    
    // Show floating button if consent already given
    if (getCookie('cookie_consent')) {
        showFloatingButton();
    }
    
    // Periodically check for new cookies (every 5 seconds)
    setInterval(function() {
        const newCookies = scanAndCategorizeCookies();
        updateCookieTables(newCookies);
    }, 5000);
});

function scanAndCategorizeCookies() {
    const cookies = document.cookie.split(';');
    const result = {
        functional: [],
        analytics: [],
        performance: [],
        advertising: [],
        uncategorized: []
    };

    cookies.forEach(cookie => {
        const [nameValue] = cookie.trim().split('=');
        const name = nameValue.trim();
        let categorized = false;
        
        // Check against our database
        for (const pattern in cookieDatabase) {
            if (name.includes(pattern)) {
                const cookieInfo = cookieDatabase[pattern];
                result[cookieInfo.category].push({
                    name: name,
                    duration: cookieInfo.duration || getCookieDuration(name),
                    description: cookieInfo.description || 'No description available'
                });
                categorized = true;
                break;
            }
        }
        
        if (!categorized && name) {
            result.uncategorized.push({
                name: name,
                duration: getCookieDuration(name),
                description: 'Unknown cookie purpose'
            });
        }
    });
    
    return result;
}

function getCookieDuration(name) {
    const cookie = document.cookie.match(`${name}=[^;]+(;|$)`);
    if (!cookie) return "Session";
    
    const expires = document.cookie.match(`${name}=[^;]+; expires=([^;]+)`);
    if (expires && expires[1]) {
        const expiryDate = new Date(expires[1]);
        return expiryDate > new Date() ? "Persistent" : "Expired";
    }
    return "Session";
}

function injectConsentHTML(detectedCookies) {
    const html = `
    <!-- Main Consent Banner -->
    <div id="cookieConsentBanner" class="cookie-consent-banner">
        <div class="cookie-consent-container">
            <div class="cookie-consent-content">
                <h2>We value your privacy</h2>
                <p>We use cookies to enhance your browsing experience. Choose which cookies you allow.</p>
                <a href="/privacy-policy/" class="privacy-policy-link">Privacy Policy</a>
            </div>
            <div class="cookie-consent-buttons">
                <button id="adjustConsentBtn" class="cookie-btn adjust-btn">Customize</button>
                <button id="rejectAllBtn" class="cookie-btn reject-btn">Reject All</button>
                <button id="acceptAllBtn" class="cookie-btn accept-btn">Accept All</button>
            </div>
        </div>
    </div>

    <!-- Settings Modal -->
    <div id="cookieSettingsModal" class="cookie-settings-modal">
        <div class="cookie-settings-content">
            <div class="cookie-settings-header">
                <h2>Cookie Preferences</h2>
                <span class="close-modal">&times;</span>
            </div>
            <div class="cookie-settings-body">
                ${generateCookieCategoryHTML('functional', 'Essential Cookies', 
                   'These cookies are necessary for the website to function and cannot be switched off.', 
                   detectedCookies.functional, true)}
                
                ${generateCookieCategoryHTML('analytics', 'Analytics Cookies', 
                   'These cookies help us understand how visitors interact with our website.', 
                   detectedCookies.analytics)}
                
                ${generateCookieCategoryHTML('performance', 'Performance Cookies', 
                   'These cookies help us improve the performance of our website.', 
                   detectedCookies.performance)}
                
                ${generateCookieCategoryHTML('advertising', 'Advertising Cookies', 
                   'These cookies are used to deliver relevant ads to you.', 
                   detectedCookies.advertising)}
                
                ${detectedCookies.uncategorized.length > 0 ? 
                   generateCookieCategoryHTML('uncategorized', 'Other Cookies', 
                   'These cookies haven\'t been categorized yet.', 
                   detectedCookies.uncategorized) : ''}
            </div>
            <div class="cookie-settings-footer">
                <button id="rejectAllSettingsBtn" class="cookie-btn reject-btn">Reject All</button>
                <button id="saveSettingsBtn" class="cookie-btn save-btn">Save Preferences</button>
                <button id="acceptAllSettingsBtn" class="cookie-btn accept-btn">Accept All</button>
            </div>
        </div>
    </div>

    <!-- Floating Settings Button -->
    <div id="cookieFloatingButton" class="cookie-settings-button" title="Cookie Settings">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path d="M257.5 27.6c-.8-5.4-4.9-9.8-10.3-10.6c-22.1-3.1-44.6 .9-64.4 11.4l-74 39.5C89.1 78.4 73.2 94.9 63.4 115L26.7 190.6c-9.8 20.1-13 42.9-9.1 64.9l14.5 82.8c3.9 22.1 14.6 42.3 30.7 57.9l60.3 58.4c16.1 15.6 36.6 25.6 58.7 28.7l83 11.7c22.1 3.1 44.6-.9 64.4-11.4l74-39.5c19.7-10.5 35.6-27 45.4-47.2l36.7-75.5c9.8-20.1 13-42.9 9.1-64.9c-.9-5.7-5.9-9.9-11.6-9.9c-51.5 0-101.5-14.7-144.9-42.3l-61.2-42.4c-10.1-7-21.8-11.1-33.9-11.9c-12.1-.9-24.1 1.6-34.9 7.2l-61.2 35.1c-6.4 3.7-14.6 1.9-19.3-4.1s-4.7-13.7 1.1-18.4l61.2-42.4c43.4-30.1 97.1-46.4 151.8-46.4c5.7 0 10.7-4.1 11.6-9.8zM133.4 303.6c-25.9 0-46.9-21-46.9-46.9s21-46.9 46.9-46.9s46.9 21 46.9 46.9s-21 46.9-46.9 46.9zm116.1-90.3c-26.5 0-48 21.5-48 48s21.5 48 48 48s48-21.5 48-48s-21.5-48-48-48zm92.3 99.7c-26.5 0-48 21.5-48 48s21.5 48 48 48s48-21.5 48-48s-21.5-48-48-48z"/>
        </svg>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

function generateCookieCategoryHTML(category, title, description, cookies, required = false) {
    return `
    <div class="cookie-category">
        <div class="toggle-container">
            <h3>${title}</h3>
            <label class="toggle-switch">
                <input type="checkbox" data-category="${category}" ${required ? 'checked disabled' : ''}>
                <span class="toggle-slider"></span>
            </label>
        </div>
        <p>${description}</p>
        
        <div class="cookie-details-container">
            <div class="cookie-details-header">
                <span>Cookie Details</span>
                <span class="toggle-details">+</span>
            </div>
            <div class="cookie-details-content" style="display: none;">
                ${cookies.length > 0 ? generateCookieTable(cookies) : 
                   '<p class="no-cookies-message">No cookies in this category detected.</p>'}
            </div>
        </div>
    </div>`;
}

function generateCookieTable(cookies) {
    return `
    <table class="cookie-details-table">
        <thead>
            <tr>
                <th>Cookie Name</th>
                <th>Duration</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            ${cookies.map(cookie => `
            <tr>
                <td><code>${cookie.name}</code></td>
                <td>${cookie.duration}</td>
                <td>${cookie.description}</td>
            </tr>`).join('')}
        </tbody>
    </table>`;
}

function initializeCookieConsent(detectedCookies) {
    const consentGiven = getCookie('cookie_consent');
    
    if (!consentGiven) {
        showCookieBanner();
    } else {
        const consentData = JSON.parse(consentGiven);
        updateConsentMode(consentData);
        loadCookiesAccordingToConsent(consentData);
        showFloatingButton();
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Setup cookie details toggles
    document.querySelectorAll('.cookie-details-header').forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const toggle = this.querySelector('.toggle-details');
            if (content.style.display === 'none') {
                content.style.display = 'block';
                toggle.textContent = '−';
            } else {
                content.style.display = 'none';
                toggle.textContent = '+';
            }
        });
    });
}

function setupEventListeners() {
    document.getElementById('acceptAllBtn').addEventListener('click', function() {
        acceptAllCookies();
        hideCookieBanner();
        showFloatingButton();
    });
    
    document.getElementById('rejectAllBtn').addEventListener('click', function() {
        rejectAllCookies();
        hideCookieBanner();
        showFloatingButton();
    });
    
    document.getElementById('adjustConsentBtn').addEventListener('click', function() {
        showCookieSettings();
        hideCookieBanner();
    });
    
    document.getElementById('acceptAllSettingsBtn').addEventListener('click', function() {
        acceptAllCookies();
        hideCookieSettings();
        showFloatingButton();
    });
    
    document.getElementById('rejectAllSettingsBtn').addEventListener('click', function() {
        rejectAllCookies();
        hideCookieSettings();
        showFloatingButton();
    });
    
    document.getElementById('saveSettingsBtn').addEventListener('click', function() {
        saveCustomSettings();
        hideCookieSettings();
        showFloatingButton();
    });
    
    document.querySelector('.close-modal').addEventListener('click', function() {
        hideCookieSettings();
        if (!getCookie('cookie_consent')) {
            showCookieBanner();
        }
    });
    
    document.getElementById('cookieFloatingButton').addEventListener('click', function() {
        showCookieBanner();
    });
}

function updateCookieTables(detectedCookies) {
    const categories = ['functional', 'analytics', 'performance', 'advertising', 'uncategorized'];
    
    categories.forEach(category => {
        const container = document.querySelector(`input[data-category="${category}"]`)?.closest('.cookie-category');
        if (container) {
            const content = container.querySelector('.cookie-details-content');
            if (content) {
                content.innerHTML = detectedCookies[category].length > 0 ? 
                    generateCookieTable(detectedCookies[category]) : 
                    '<p class="no-cookies-message">No cookies in this category detected.</p>';
            }
        }
    });
}

function showFloatingButton() {
    document.getElementById('cookieFloatingButton').style.display = 'flex';
}

function hideFloatingButton() {
    document.getElementById('cookieFloatingButton').style.display = 'none';
}

function showCookieBanner() {
    document.getElementById('cookieConsentBanner').style.display = 'block';
}

function hideCookieBanner() {
    document.getElementById('cookieConsentBanner').style.display = 'none';
}

function showCookieSettings() {
    document.getElementById('cookieSettingsModal').style.display = 'block';
    hideCookieBanner();
    
    // Load current settings
    const consent = getCookie('cookie_consent');
    if (consent) {
        const consentData = JSON.parse(consent);
        document.querySelector('input[data-category="analytics"]').checked = consentData.categories.analytics;
        document.querySelector('input[data-category="performance"]').checked = consentData.categories.performance;
        document.querySelector('input[data-category="advertising"]').checked = consentData.categories.advertising;
        if (document.querySelector('input[data-category="uncategorized"]')) {
            document.querySelector('input[data-category="uncategorized"]').checked = consentData.categories.uncategorized;
        }
    }
}

function hideCookieSettings() {
    document.getElementById('cookieSettingsModal').style.display = 'none';
}

function updateConsentMode(consentData) {
    const consentStates = {
        'ad_storage': consentData.categories.advertising ? 'granted' : 'denied',
        'analytics_storage': consentData.categories.analytics ? 'granted' : 'denied',
        'ad_user_data': consentData.categories.advertising ? 'granted' : 'denied',
        'ad_personalization': consentData.categories.advertising ? 'granted' : 'denied',
        'personalization_storage': consentData.categories.performance ? 'granted' : 'denied',
        'functionality_storage': consentData.categories.functional ? 'granted' : 'denied',
        'security_storage': 'granted'
    };

    // Update consent mode immediately
    gtag('consent', 'update', consentStates);
    
    // Determine GCS signal
    let gcsSignal = 'G100'; // Default to denied
    
    if (consentData.status === 'accepted') {
        gcsSignal = 'G111';
    } else if (consentData.status === 'custom') {
        gcsSignal = 'G101';
    }
    
    // Send GCS signal immediately
    if (window.dataLayer) {
        window.dataLayer.push({
            'event': 'cookie_consent_update',
            'consent_mode': consentStates,
            'gcs': gcsSignal,
            'timestamp': new Date().toISOString()
        });
    }
}

function acceptAllCookies() {
    const consentData = {
        status: 'accepted',
        gcs: 'G111',
        categories: {
            functional: true,
            analytics: true,
            performance: true,
            advertising: true,
            uncategorized: true
        },
        timestamp: new Date().getTime()
    };
    
    setCookie('cookie_consent', JSON.stringify(consentData), 365);
    updateConsentMode(consentData);
    loadCookiesAccordingToConsent(consentData);
}

function rejectAllCookies() {
    const consentData = {
        status: 'rejected',
        gcs: 'G100',
        categories: {
            functional: true,  // Essential cookies always enabled
            analytics: false,
            performance: false,
            advertising: false,
            uncategorized: false
        },
        timestamp: new Date().getTime()
    };
    
    setCookie('cookie_consent', JSON.stringify(consentData), 365);
    updateConsentMode(consentData);
}

function saveCustomSettings() {
    const consentData = {
        status: 'custom',
        gcs: 'G101',
        categories: {
            functional: true,  // Essential cookies always enabled
            analytics: document.querySelector('input[data-category="analytics"]').checked,
            performance: document.querySelector('input[data-category="performance"]').checked,
            advertising: document.querySelector('input[data-category="advertising"]').checked,
            uncategorized: document.querySelector('input[data-category="uncategorized"]') ? 
                document.querySelector('input[data-category="uncategorized"]').checked : false
        },
        timestamp: new Date().getTime()
    };
    
    setCookie('cookie_consent', JSON.stringify(consentData), 365);
    updateConsentMode(consentData);
    loadCookiesAccordingToConsent(consentData);
}

function loadCookiesAccordingToConsent(consentData) {
    if (consentData.categories.analytics) {
        loadAnalyticsCookies();
    }
    
    if (consentData.categories.advertising) {
        loadAdvertisingCookies();
    }
    
    if (consentData.categories.performance) {
        loadPerformanceCookies();
    }
}

function loadAnalyticsCookies() {
    console.log('Loading analytics cookies');
    // Implement your analytics tracking here
    if (typeof ga === 'undefined' && typeof gtag === 'function') {
        gtag('js', new Date());
        gtag('config', 'YOUR_GA4_MEASUREMENT_ID');
    }
}

function loadAdvertisingCookies() {
    console.log('Loading advertising cookies');
    // Implement your advertising tracking here
    if (typeof fbq === 'undefined') {
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', 'YOUR_PIXEL_ID');
        fbq('track', 'PageView');
    }
}

function loadPerformanceCookies() {
    console.log('Loading performance cookies');
    // Implement performance tracking here
}

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax; Secure";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
