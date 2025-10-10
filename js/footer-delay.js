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
    const desktopIndicator = document.createElement('div');
    desktopIndicator.innerHTML = '🖥️ Desktop - no delay';
    desktopIndicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0,100,0,0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 9999;
      font-family: monospace;
    `;
    document.body.appendChild(desktopIndicator);
    setTimeout(() => {
      if (desktopIndicator.parentNode) {
        desktopIndicator.parentNode.removeChild(desktopIndicator);
      }
    }, 2000);
    return;
  }
  
  // Add visual debug indicator for mobile
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
  
  // Add touch capability indicator
  const touchIndicator = document.createElement('div');
  touchIndicator.innerHTML = '👆 Touch events enabled';
  touchIndicator.style.cssText = `
    position: fixed;
    top: 10px;
    left: 10px;
    background: rgba(0,100,100,0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 9999;
    font-family: monospace;
  `;
  document.body.appendChild(touchIndicator);
  
  // Remove debug indicators after 3 seconds
  setTimeout(() => {
    if (debugIndicator.parentNode) {
      debugIndicator.parentNode.removeChild(debugIndicator);
    }
    if (touchIndicator.parentNode) {
      touchIndicator.parentNode.removeChild(touchIndicator);
    }
  }, 3000);
  
  const footerLinks = document.querySelectorAll('.footer a[href]');
  
  // Show footer links count
  const linksIndicator = document.createElement('div');
  linksIndicator.innerHTML = `🔗 Found ${footerLinks.length} footer links`;
  linksIndicator.style.cssText = `
    position: fixed;
    top: 50px;
    right: 10px;
    background: rgba(0,0,100,0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 9999;
    font-family: monospace;
  `;
  document.body.appendChild(linksIndicator);
  setTimeout(() => {
    if (linksIndicator.parentNode) {
      linksIndicator.parentNode.removeChild(linksIndicator);
    }
  }, 2000);
  
  footerLinks.forEach(link => {
    // Add both click and touchstart events for mobile
    const handleInteraction = function(e) {
      // Show click indicator
      const clickIndicator = document.createElement('div');
      clickIndicator.innerHTML = `👆 Clicked: ${this.getAttribute('href')}`;
      clickIndicator.style.cssText = `
        position: fixed;
        top: 90px;
        right: 10px;
        background: rgba(100,0,0,0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 9999;
        font-family: monospace;
      `;
      document.body.appendChild(clickIndicator);
      setTimeout(() => {
        if (clickIndicator.parentNode) {
          clickIndicator.parentNode.removeChild(clickIndicator);
        }
      }, 1000);
      
      // Don't delay if it's the same page or a hash link
      if (this.getAttribute('href').startsWith('#') || 
          this.getAttribute('href') === window.location.pathname) {
        const samePageIndicator = document.createElement('div');
        samePageIndicator.innerHTML = '🚫 Same page - no delay';
        samePageIndicator.style.cssText = `
          position: fixed;
          top: 130px;
          right: 10px;
          background: rgba(100,100,0,0.8);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          z-index: 9999;
          font-family: monospace;
        `;
        document.body.appendChild(samePageIndicator);
        setTimeout(() => {
          if (samePageIndicator.parentNode) {
            samePageIndicator.parentNode.removeChild(samePageIndicator);
          }
        }, 1000);
        return;
      }
      
      e.preventDefault();
      const href = this.getAttribute('href');
      
      // Show delay indicator
      const delayIndicator = document.createElement('div');
      delayIndicator.innerHTML = `⏳ Delaying to: ${href}`;
      delayIndicator.style.cssText = `
        position: fixed;
        top: 130px;
        right: 10px;
        background: rgba(0,100,100,0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 9999;
        font-family: monospace;
      `;
      document.body.appendChild(delayIndicator);
      
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
          // Create a temporary style to trigger the animation
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
          
          // Remove the style after animation completes
          setTimeout(() => {
            if (style.parentNode) {
              style.parentNode.removeChild(style);
            }
          }, 1500);
          
          // Show animation indicator
          const animationIndicator = document.createElement('div');
          animationIndicator.innerHTML = `🎨 Animation: ${animationName}`;
          animationIndicator.style.cssText = `
            position: fixed;
            top: 170px;
            right: 10px;
            background: rgba(100,0,100,0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 9999;
            font-family: monospace;
          `;
          document.body.appendChild(animationIndicator);
          setTimeout(() => {
            if (animationIndicator.parentNode) {
              animationIndicator.parentNode.removeChild(animationIndicator);
            }
          }, 1000);
        }
      }
      
      // Add a small delay to show the crumple animation
      setTimeout(() => {
        // Show navigation indicator
        const navIndicator = document.createElement('div');
        navIndicator.innerHTML = `🚀 Navigating to: ${href}`;
        navIndicator.style.cssText = `
          position: fixed;
          top: 210px;
          right: 10px;
          background: rgba(0,100,0,0.8);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          z-index: 9999;
          font-family: monospace;
        `;
        document.body.appendChild(navIndicator);
        setTimeout(() => {
          if (navIndicator.parentNode) {
            navIndicator.parentNode.removeChild(navIndicator);
          }
        }, 500);
        
        window.location.href = href;
      }, 800); // 800ms delay
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
