/**
 * Dynamic Projects Loader
 *
 * Fetches public repos from GitHub API and renders project cards.
 * Filters: non-forked, has description.
 * Caches in sessionStorage to avoid hitting the 60 req/hr unauthenticated limit.
 *
 * To control which repos appear: add a description on GitHub.
 * Repos without descriptions are hidden.
 */

(function() {
    'use strict';

    var GITHUB_USER = 'jvkuechen';
    var API_URL = 'https://api.github.com/users/' + GITHUB_USER + '/repos?per_page=100&type=public';
    var CACHE_KEY = 'jvk_github_repos';
    var CACHE_TTL = 10 * 60 * 1000; // 10 minutes

    document.addEventListener('DOMContentLoaded', loadProjects);

    function loadProjects() {
        var container = document.getElementById('project-cards');
        if (!container) return;

        // Try cache first
        var cached = getCachedRepos();
        if (cached) {
            renderProjects(container, cached);
            return;
        }

        // Fetch from GitHub
        fetch(API_URL)
            .then(function(response) {
                if (!response.ok) throw new Error('GitHub API returned ' + response.status);
                return response.json();
            })
            .then(function(repos) {
                var filtered = filterRepos(repos);
                cacheRepos(filtered);
                renderProjects(container, filtered);
            })
            .catch(function(err) {
                console.warn('Failed to load repos from GitHub:', err);
                renderFallback(container);
            });
    }

    function filterRepos(repos) {
        return repos
            .filter(function(r) {
                return !r.fork && r.description && r.description.trim().length > 0;
            })
            .sort(function(a, b) {
                // Sort by most recently pushed
                return new Date(b.pushed_at) - new Date(a.pushed_at);
            })
            .map(function(r) {
                return {
                    name: r.name,
                    description: r.description,
                    url: r.html_url,
                    language: r.language,
                    stars: r.stargazers_count,
                    pushed: r.pushed_at,
                    topics: r.topics || [],
                    has_wiki: r.has_wiki
                };
            });
    }

    function renderProjects(container, repos) {
        if (repos.length === 0) {
            container.innerHTML =
                '<div class="col-lg-8 col-lg-offset-2 text-center">' +
                '<p class="text-muted">Projects coming soon. ' +
                '<a href="https://github.com/' + GITHUB_USER + '">View on GitHub</a></p>' +
                '</div>';
            return;
        }

        var html = '';
        for (var i = 0; i < repos.length; i++) {
            var repo = repos[i];
            var languageBadge = repo.language
                ? '<span class="label label-default" style="font-weight: normal; margin-left: 6px;">' + escapeHtml(repo.language) + '</span>'
                : '';

            var docsLink = repo.has_wiki
                ? ' &middot; <a href="wiki/#/projects/' + escapeHtml(repo.name) + '">Docs</a>'
                : '';

            html +=
                '<div class="col-md-4 col-sm-6">' +
                '<div class="article" style="margin-bottom: 30px;">' +
                '<h4>' + escapeHtml(repo.name) + languageBadge + '</h4>' +
                '<p class="text-muted">' + escapeHtml(repo.description) + '</p>' +
                '<a href="' + escapeHtml(repo.url) + '">GitHub</a>' +
                docsLink +
                '</div>' +
                '</div>';

            // Row break every 3 cards
            if ((i + 1) % 3 === 0 && i + 1 < repos.length) {
                html += '</div><div class="row" style="margin-top: 0;">';
            }
        }

        container.innerHTML = html;
    }

    function renderFallback(container) {
        container.innerHTML =
            '<div class="col-lg-8 col-lg-offset-2 text-center">' +
            '<p class="text-muted">Could not load projects. ' +
            '<a href="https://github.com/' + GITHUB_USER + '">View on GitHub</a></p>' +
            '</div>';
    }

    function getCachedRepos() {
        try {
            var raw = sessionStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            var data = JSON.parse(raw);
            if (Date.now() - data.timestamp > CACHE_TTL) {
                sessionStorage.removeItem(CACHE_KEY);
                return null;
            }
            return data.repos;
        } catch (e) {
            return null;
        }
    }

    function cacheRepos(repos) {
        try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                repos: repos
            }));
        } catch (e) {
            // sessionStorage full or unavailable
        }
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

})();
