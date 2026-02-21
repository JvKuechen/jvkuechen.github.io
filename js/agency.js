/**
 * Agency theme behavior - vanilla JS (no jQuery)
 * Replaces: lib/agency.js, lib/cbpAnimatedHeader.js, lib/classie.js, lib/jquery.easing.min.js
 */
(function() {
    'use strict';

    // --- Scroll-shrink navbar ---
    var navbar = document.querySelector('.navbar');
    var didScroll = false;
    var shrinkThreshold = 50;

    if (navbar) {
        window.addEventListener('scroll', function() {
            if (!didScroll) {
                didScroll = true;
                requestAnimationFrame(function() {
                    if (window.pageYOffset >= shrinkThreshold) {
                        navbar.classList.add('navbar-shrink');
                    } else {
                        navbar.classList.remove('navbar-shrink');
                    }
                    didScroll = false;
                });
            }
        });
    }

    // --- Smooth scroll for .page-scroll links ---
    document.addEventListener('click', function(e) {
        var link = e.target.closest('a.page-scroll');
        if (!link) return;

        var targetId = link.getAttribute('href');
        if (!targetId || targetId.charAt(0) !== '#') return;

        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
    });

    // --- Close mobile menu on nav link click ---
    document.addEventListener('click', function(e) {
        var navLink = e.target.closest('.navbar-collapse .nav-link');
        if (!navLink) return;

        var collapseEl = document.querySelector('.navbar-collapse');
        if (!collapseEl || !collapseEl.classList.contains('show')) return;

        var bsCollapse = bootstrap.Collapse.getInstance(collapseEl);
        if (bsCollapse) {
            bsCollapse.hide();
        }
    });
})();
