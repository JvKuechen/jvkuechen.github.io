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
            headline: 'Platform Engineer',
            title: 'Jeff Kuechenmeister | Platform Engineer',
            description: 'IT specialist building enterprise infrastructure, security systems, and automation for regulated environments.',
            favicon: 'img/profile.jpg',
            faviconType: 'image/jpeg',
            defaultSection: 'about'
        },
        'www.jvkuechen.com': {
            brand: 'Jeff Kuechenmeister',
            headline: 'Platform Engineer',
            title: 'Jeff Kuechenmeister | Platform Engineer',
            description: 'IT specialist building enterprise infrastructure, security systems, and automation for regulated environments.',
            favicon: 'img/profile.jpg',
            faviconType: 'image/jpeg',
            defaultSection: 'about'
        },
        'jvkuechen.github.io': {
            brand: 'Jeff Kuechenmeister',
            headline: 'Platform Engineer',
            title: 'Jeff Kuechenmeister | Platform Engineer',
            description: 'IT specialist building enterprise infrastructure, security systems, and automation for regulated environments.',
            favicon: 'img/profile.jpg',
            faviconType: 'image/jpeg',
            defaultSection: 'about'
        },
        'setcookie.dev': {
            brand: 'SetCookie.dev',
            headline: 'Platform Engineer',
            title: 'SetCookie.dev',
            description: 'Infrastructure, security, and automation. Technical writing, projects, and homelab demos.',
            favicon: 'img/cookie-favicon.svg',
            faviconType: 'image/svg+xml',
            defaultSection: 'projects'
        },
        'www.setcookie.dev': {
            brand: 'SetCookie.dev',
            headline: 'Platform Engineer',
            title: 'SetCookie.dev',
            description: 'Infrastructure, security, and automation. Technical writing, projects, and homelab demos.',
            favicon: 'img/cookie-favicon.svg',
            faviconType: 'image/svg+xml',
            defaultSection: 'projects'
        },
        'localhost': {
            brand: 'Jeff Kuechenmeister',
            headline: 'Platform Engineer',
            title: 'Jeff Kuechenmeister | Platform Engineer',
            description: 'IT specialist building enterprise infrastructure, security systems, and automation for regulated environments.',
            favicon: 'favicon.svg',
            faviconType: 'image/svg+xml',
            defaultSection: 'about'
        },
        '127.0.0.1': {
            brand: 'Jeff Kuechenmeister',
            headline: 'Platform Engineer',
            title: 'Jeff Kuechenmeister | Platform Engineer',
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

        // demos-status is rendered server-side now (static HTML cards + a
        // fallback line). Router no longer writes to it -- see the
        // Demos section in index.html.
    });

})();
