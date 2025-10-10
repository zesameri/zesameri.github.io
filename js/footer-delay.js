/**
 * Footer Link Delay Script
 * Adds a delay to footer links to allow crumple animations to play
 */

function initFooterDelay() {
  // Only apply delay on mobile devices
  const isMobile = window.matchMedia("only screen and (max-width: 850px)").matches ||
                   /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (!isMobile) {
    // Show desktop indicator
    return;
  }
  
  
  const footerLinks = document.querySelectorAll('.footer a[href]');
  
  footerLinks.forEach(link => {
    // Add both click and touchstart events for mobile
    const handleInteraction = function(e) {
      // Don't delay if it's the same page or a hash link
      if (this.getAttribute('href').startsWith('#') || 
          this.getAttribute('href') === window.location.pathname) {
        return;
      }
      
      e.preventDefault();
      const href = this.getAttribute('href');
      
      
      // Trigger crumple animation manually
      const crumple = document.querySelector('.crumple');
      const crumpleAfter = document.querySelector('.crumple:after');
      if (crumple) {
        crumple.style.zIndex = '0';
        
        // Determine which animation to trigger based on link class
        const linkClass = this.className;
        let animationName = '';
        
        if (linkClass.includes('footer__link--home')) {
          animationName = 'a';
        } else if (linkClass.includes('footer__link--github')) {
          animationName = 'b';
        } else if (linkClass.includes('footer__link--playlists')) {
          animationName = 'c';
        } else if (linkClass.includes('footer__link--instagram')) {
          animationName = 'f';
        } else if (linkClass.includes('footer__link--alhambra')) {
          animationName = 'd';
        } else if (linkClass.includes('footer__link--writings')) {
          animationName = 'e';
        }
        
        if (animationName) {
          // Add mobile-trigger class for CSS-based animation
          this.classList.add('mobile-trigger');
          
          // Also create a temporary style as fallback
          const style = document.createElement('style');
          let backgroundStyle = '';
          
          // Set background color based on link type
          if (linkClass.includes('footer__link--writings')) {
            backgroundStyle = 'background: #020121; z-index: 0;';
          } else if (linkClass.includes('footer__link--alhambra')) {
            backgroundStyle = 'background: #020121; z-index: 0;';
          }
          
          style.textContent = `
            .crumple {
              ${backgroundStyle}
            }
            .crumple:after {
              -webkit-animation: ${animationName} 1s .25s linear forwards;
              animation: ${animationName} 1s .25s linear forwards;
              background-color: #222;
            }
          `;
          document.head.appendChild(style);
          
          // Remove the style and mobile-trigger class after animation completes
          setTimeout(() => {
            if (style.parentNode) {
              style.parentNode.removeChild(style);
            }
            this.classList.remove('mobile-trigger');
          }, 1500);
          
        }
      }
      
      // Delay navigation to match crumple animation duration
      setTimeout(() => {
        window.location.href = href;
      }, 1500); // 1.5 second delay to match crumple animation
    };
    
    // Add both click and touch events
    link.addEventListener('click', handleInteraction);
    link.addEventListener('touchstart', function(e) {
      // Prevent default touch behavior and call our handler
      e.preventDefault();
      handleInteraction.call(this, e);
    });
  });
}

// Run immediately if DOM is ready, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFooterDelay);
} else {
  initFooterDelay();
}
