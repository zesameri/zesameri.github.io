/**
 * Footer Link Delay Script
 * Adds a delay to footer links to allow crumple animations to play
 */

document.addEventListener('DOMContentLoaded', function() {
  const footerLinks = document.querySelectorAll('.footer a[href]');
  
  footerLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Don't delay if it's the same page or a hash link
      if (this.getAttribute('href').startsWith('#') || 
          this.getAttribute('href') === window.location.pathname) {
        return;
      }
      
      e.preventDefault();
      const href = this.getAttribute('href');
      
      // Add a small delay to show the crumple animation
      setTimeout(() => {
        window.location.href = href;
      }, 800); // 800ms delay
    });
  });
});
