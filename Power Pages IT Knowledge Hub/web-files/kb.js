(function (window, document) {
    "use strict";

    var KB = window.WFWKnowledgeHub = window.WFWKnowledgeHub || {};

    function getToken() {
        return new Promise(function (resolve, reject) {
            if (!window.shell || !window.shell.getTokenDeferred) {
                reject(new Error("Power Pages request token is unavailable."));
                return;
            }

            window.shell.getTokenDeferred().done(resolve).fail(reject);
        });
    }

    KB.api = function (options) {
        options = options || {};

        return getToken().then(function (token) {
            var headers = Object.assign({
                "Accept": "application/json",
                "Content-Type": "application/json",
                "__RequestVerificationToken": token
            }, options.headers || {});

            return fetch(options.url, {
                method: options.method || "GET",
                headers: headers,
                body: options.body ? JSON.stringify(options.body) : undefined,
                credentials: "same-origin"
            });
        }).then(function (response) {
            if (response.ok) {
                if (response.status === 204) {
                    return { response: response, data: null };
                }

                return response.json().then(function (data) {
                    return { response: response, data: data };
                });
            }

            return response.text().then(function (body) {
                var message = "Request failed (" + response.status + ").";
                try {
                    var parsed = JSON.parse(body);
                    message = parsed.error && parsed.error.message ? parsed.error.message : message;
                } catch (ignore) {
                    if (body) {
                        message = body;
                    }
                }
                throw new Error(message);
            });
        });
    };

    KB.articleUrl = function (id) {
        return "/_api/cr4b3_kbarticles(" + encodeURIComponent(id) + ")";
    };

    KB.setBusy = function (button, isBusy, busyText) {
        if (!button) {
            return;
        }

        if (isBusy) {
            button.dataset.originalText = button.textContent;
            button.disabled = true;
            button.textContent = busyText || "Saving…";
        } else {
            button.disabled = false;
            button.textContent = button.dataset.originalText || button.textContent;
        }
    };

    KB.showMessage = function (container, message, type) {
        if (!container) {
            return;
        }

        container.textContent = "";
        var notice = document.createElement("div");
        notice.className = "kb-notice kb-notice--" + (type || "info");
        notice.setAttribute("role", type === "error" ? "alert" : "status");
        notice.textContent = message;
        container.appendChild(notice);
        notice.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };

    KB.deleteArticle = function (id, redirectUrl) {
        if (!id || !window.confirm("Delete this article permanently?")) {
            return Promise.resolve(false);
        }

        return KB.api({
            url: KB.articleUrl(id),
            method: "DELETE"
        }).then(function () {
            window.location.assign(redirectUrl || "/articles");
            return true;
        }).catch(function (error) {
            window.alert("The article could not be deleted. " + error.message);
            return false;
        });
    };

    KB.incrementView = function (id) {
        if (!id || window.sessionStorage.getItem("kb-viewed-" + id)) {
            return;
        }

        KB.api({
            url: "/_api/cr4b3_kbviews",
            method: "POST",
            body: {
                cr4b3_name: "Article view",
                "cr4b3_Article@odata.bind": "/cr4b3_kbarticles(" + id + ")"
            }
        }).then(function () {
            window.sessionStorage.setItem("kb-viewed-" + id, "1");
        }).catch(function () {
            // Reading an article must still work if event logging is unavailable.
        });
    };

    function setupTheme() {
        var key = "wfw-kb-theme";
        var saved = window.localStorage.getItem(key);
        if (saved === "dark") {
            document.documentElement.setAttribute("data-theme", "dark");
        }

        document.querySelectorAll("[data-kb-theme-toggle]").forEach(function (button) {
            function updateLabel() {
                var dark = document.documentElement.getAttribute("data-theme") === "dark";
                button.setAttribute("aria-pressed", String(dark));
                button.querySelector(".theme-text").textContent = dark ? "Light mode" : "Dark mode";
                button.querySelector(".theme-icon").textContent = dark ? "☀" : "☾";
            }

            updateLabel();
            button.addEventListener("click", function () {
                var dark = document.documentElement.getAttribute("data-theme") === "dark";
                if (dark) {
                    document.documentElement.removeAttribute("data-theme");
                    window.localStorage.setItem(key, "light");
                } else {
                    document.documentElement.setAttribute("data-theme", "dark");
                    window.localStorage.setItem(key, "dark");
                }
                updateLabel();
            });
        });
    }

    function setupMobileNavigation() {
        document.querySelectorAll("[data-kb-menu-toggle]").forEach(function (button) {
            button.addEventListener("click", function () {
                var sidebar = document.querySelector(".kb-sidebar");
                var open = sidebar && sidebar.classList.toggle("is-open");
                button.setAttribute("aria-expanded", String(Boolean(open)));
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupTheme();
        setupMobileNavigation();
    });
})(window, document);
