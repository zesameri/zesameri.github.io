/**
 * Footer Link Delay Script
 * Adds a delay to footer links to allow crumple animations to play
 */

function initFooterDelay() {
  // Only apply delay on mobile devices
  const isMobile = window.matchMedia("only screen and (max-width: 850px)").matches ||
                   /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (!isMobile) {
    console.log('Desktop detected - no delay needed');
    return;
  }
  
  console.log('Mobile detected - footer delay enabled');
  
  // Add visual debug indicator
  const debugIndicator = document.createElement('div');
  debugIndicator.innerHTML = '📱 Mobile delay active';
  debugIndicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 9999;
    font-family: monospace;
  `;
  document.body.appendChild(debugIndicator);
  
  // Remove debug indicator after 3 seconds
  setTimeout(() => {
    if (debugIndicator.parentNode) {
      debugIndicator.parentNode.removeChild(debugIndicator);
    }
  }, 3000);
  
  const footerLinks = document.querySelectorAll('.footer a[href]');
  console.log('Found footer links:', footerLinks.length);
  
  footerLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      console.log('Footer link clicked:', this.getAttribute('href'));
      
      // Don't delay if it's the same page or a hash link
      if (this.getAttribute('href').startsWith('#') || 
          this.getAttribute('href') === window.location.pathname) {
        console.log('Same page or hash link, no delay');
        return;
      }
      
      e.preventDefault();
      const href = this.getAttribute('href');
      console.log('Delaying navigation to:', href);
      
      // Add a small delay to show the crumple animation
      setTimeout(() => {
        console.log('Navigating to:', href);
        window.location.href = href;
      }, 800); // 800ms delay
    });
  });
}

// Run immediately if DOM is ready, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFooterDelay);
} else {
  initFooterDelay();
}
