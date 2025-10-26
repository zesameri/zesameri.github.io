/**
 * Crumple Hover Effects
 * Handles video hover effects for footer links on desktop devices
 */

// Detect mobile devices more comprehensively
function isMobileDevice() {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const hasHover = window.matchMedia('(hover: hover)').matches;
  const isSmallScreen = window.innerWidth <= 768;
  
  return isMobileUA || (isTouchDevice && !hasHover && isSmallScreen);
}

// Initialize crumple hover effects
function initCrumpleHover() {
  // Only enable video crumples on desktop devices
  // On mobile devices, fall back to color-based crumples and skip video loading
  if (window.matchMedia('(hover: hover)').matches && !isMobileDevice()) {
    document.body.classList.add('has-hover');
    
    // Play videos on hover - only on desktop
    const footerLinks = document.querySelectorAll('.footer a');
    
    footerLinks.forEach((link) => {
      const videoClass = link.className.replace('footer__link--', 'crumple-video--');
      const video = document.querySelector('.' + videoClass);
      
      if (video) {
        link.addEventListener('mouseenter', async () => {
          try {
            // Check if video source needs to be loaded
            const source = video.querySelector('source[data-src]');
            if (source && source.dataset.src) {
              source.src = source.dataset.src;
              source.removeAttribute('data-src');
              video.load();
              
              // Wait for video to be ready
              await new Promise((resolve) => {
                if (video.readyState >= 3) {
                  resolve();
                } else {
                  video.addEventListener('canplaythrough', resolve, { once: true });
                }
              });
            }
            
            await video.play();
          } catch (e) {
            console.log('Video play failed:', e);
          }
        });
      }
    });
  } else {
    // Mobile: Use color-based crumples instead, no video loading
    document.body.classList.add('no-hover');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCrumpleHover);
} else {
  initCrumpleHover();
}
