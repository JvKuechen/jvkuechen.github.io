/**
 * Domain-based Router
 *
 * Routes different domains to different default views and branding:
 * - jvkuechen.com / jvkuechen.github.io -> "Jeff Kuechenmeister" brand, profile photo favicon
 * - setcookie.dev -> "SetCookie.dev" brand, cookie icon favicon
 *
 * Swaps: navbar brand text, hero headline, page title, meta description, favicon.
 */

(function() {
    'use strict';

    var DOMAIN_CONFIG = {
        'jvkuechen.com': {
            brand: 'Jeff Kuechenmeister',
            headline: 'IT Specialist',
            title: 'Jeff Kuechenmeister | IT Specialist',
            description: 'IT specialist building enterprise infrastructure, security systems, and automation for regulated environments.',
            favicon: 'img/profile.jpg',
            faviconType: 'image/jpeg',
            defaultSection: 'about'
        },
        'www.jvkuechen.com': {
            brand: 'Jeff Kuechenmeister',
            headline: 'IT Specialist',
            title: 'Jeff Kuechenmeister | IT Specialist',
            description: 'IT specialist building enterprise infrastructure, security systems, and automation for regulated environments.',
            favicon: 'img/profile.jpg',
            faviconType: 'image/jpeg',
            defaultSection: 'about'
        },
        'jvkuechen.github.io': {
            brand: 'Jeff Kuechenmeister',
            headline: 'IT Specialist',
            title: 'Jeff Kuechenmeister | IT Specialist',
            description: 'IT specialist building enterprise infrastructure, security systems, and automation for regulated environments.',
            favicon: 'img/profile.jpg',
            faviconType: 'image/jpeg',
            defaultSection: 'about'
        },
        'setcookie.dev': {
            brand: 'SetCookie.dev',
            headline: 'IT Specialist',
            title: 'SetCookie.dev',
            description: 'Infrastructure, security, and automation. Technical writing, projects, and homelab demos.',
            favicon: 'img/cookie-favicon.svg',
            faviconType: 'image/svg+xml',
            defaultSection: 'projects'
        },
        'www.setcookie.dev': {
            brand: 'SetCookie.dev',
            headline: 'IT Specialist',
            title: 'SetCookie.dev',
            description: 'Infrastructure, security, and automation. Technical writing, projects, and homelab demos.',
            favicon: 'img/cookie-favicon.svg',
            faviconType: 'image/svg+xml',
            defaultSection: 'projects'
        },
        'localhost': {
            brand: 'Jeff Kuechenmeister',
            headline: 'IT Specialist',
            title: 'Jeff Kuechenmeister | IT Specialist',
            description: 'IT specialist building enterprise infrastructure, security systems, and automation for regulated environments.',
            favicon: 'favicon.svg',
            faviconType: 'image/svg+xml',
            defaultSection: 'about'
        },
        '127.0.0.1': {
            brand: 'Jeff Kuechenmeister',
            headline: 'IT Specialist',
            title: 'Jeff Kuechenmeister | IT Specialist',
            description: 'IT specialist building enterprise infrastructure, security systems, and automation for regulated environments.',
            favicon: 'favicon.svg',
            faviconType: 'image/svg+xml',
            defaultSection: 'about'
        }
    };

    document.addEventListener('DOMContentLoaded', function() {
        var host = window.location.hostname;
        var config = DOMAIN_CONFIG[host] || DOMAIN_CONFIG['localhost'];

        // Set navbar brand
        var brand = document.getElementById('nav-brand');
        if (brand) {
            brand.textContent = config.brand;
        }

        // Set hero headline
        var headline = document.getElementById('hero-headline');
        if (headline) {
            headline.textContent = config.headline;
        }

        // Set page title
        document.title = config.title;

        // Set meta description
        var metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', config.description);
        }

        // Set OG tags
        var ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
            ogTitle.setAttribute('content', config.title);
        }
        var ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) {
            ogDesc.setAttribute('content', config.description);
        }
        var ogSiteName = document.querySelector('meta[property="og:site_name"]');
        if (ogSiteName) {
            ogSiteName.setAttribute('content', config.brand);
        }

        // Swap favicon
        var faviconLink = document.querySelector('link[rel="icon"]');
        if (faviconLink) {
            faviconLink.setAttribute('href', config.favicon);
            faviconLink.setAttribute('type', config.faviconType);
        }

        // Check demo server status
        checkDemoStatus();
    });

    /**
     * Check if homelab demo servers are reachable.
     * On GitHub Pages (no homelab), demos show as offline.
     */
    function checkDemoStatus() {
        var statusEl = document.getElementById('demos-status');
        if (!statusEl) return;

        // Demo endpoints to check (will be populated as demos are added)
        var demos = [];

        if (demos.length === 0) {
            statusEl.textContent = 'Demos coming soon. Check back later.';
            return;
        }
    }

})();
