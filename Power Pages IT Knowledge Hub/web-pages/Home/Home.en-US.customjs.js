/* ========================================
   IT Knowledge Hub Theme Toggle
   Uses data-theme attribute and CSS variables
======================================== */

document.addEventListener("DOMContentLoaded", function () {
    const STORAGE_KEY = "kb-theme";
    const themeToggle = document.getElementById("themeToggle");
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem(STORAGE_KEY) || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    // Apply theme
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateToggleButton(themeToggle, true);
    } else {
        document.documentElement.removeAttribute('data-theme');
        updateToggleButton(themeToggle, false);
    }
    
    // Toggle theme on button click
    if (themeToggle) {
        themeToggle.addEventListener("click", function () {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            
            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem(STORAGE_KEY, 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem(STORAGE_KEY, 'dark');
            }
            
            updateToggleButton(themeToggle, !isDark);
        });
    }
    
    // Also add theme toggle to navbar if it exists
    const navbar = document.querySelector(".navbar");
    if (navbar) {
        const navbarToggle = document.createElement("button");
        navbarToggle.className = "theme-toggle-navbar";
        navbarToggle.setAttribute("aria-label", "Toggle Theme");
        navbarToggle.innerHTML = document.documentElement.getAttribute('data-theme') === 'dark' ? "☀️" : "🌙";
        
        navbarToggle.addEventListener("click", function () {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            
            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem(STORAGE_KEY, 'light');
                navbarToggle.innerHTML = "🌙";
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem(STORAGE_KEY, 'dark');
                navbarToggle.innerHTML = "☀️";
            }
        });
        
        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.alignItems = "center";
        wrapper.style.marginLeft = "12px";
        wrapper.appendChild(navbarToggle);
        navbar.appendChild(wrapper);
    }
});

function updateToggleButton(button, isDark) {
    if (!button) return;
    const icon = button.querySelector('.theme-icon');
    const text = button.querySelector('.theme-text');
    
    if (icon) {
        icon.textContent = isDark ? '☀️' : '🌙';
    }
    if (text) {
        text.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    }
}
