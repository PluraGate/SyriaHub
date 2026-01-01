// Theme initialization script - runs before React hydration to prevent flash
(function() {
  try {
    var prefs = JSON.parse(localStorage.getItem('user_preferences'));
    var theme = prefs ? prefs.theme : 'system';
    var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {
    // Silently fail if localStorage is unavailable
  }
})();
