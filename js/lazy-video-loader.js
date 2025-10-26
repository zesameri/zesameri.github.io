/**
 * Lazy Video Loader
 * Loads videos after page load to prevent freezing
 */

class LazyVideoLoader {
  constructor() {
    this.loadedVideos = new Set();
    this.isMobile = this.detectMobile();
    this.init();
  }

  detectMobile() {
    // Check for mobile devices using multiple methods
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hasHover = window.matchMedia('(hover: hover)').matches;
    const isSmallScreen = window.innerWidth <= 768;
    
    const isMobile = isMobileUA || (isTouchDevice && !hasHover && isSmallScreen);
    
    // Log detection results for debugging
    console.log('Mobile Detection:', {
      userAgent: isMobileUA,
      touchDevice: isTouchDevice,
      hasHover: hasHover,
      smallScreen: isSmallScreen,
      screenWidth: window.innerWidth,
      finalResult: isMobile
    });
    
    return isMobile;
  }

  init() {
    // Wait for page to fully load before starting video loading
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => this.loadHeroVideo(), 500);
      });
    } else {
      setTimeout(() => this.loadHeroVideo(), 500);
    }
  }

  async loadHeroVideo() {
    const heroVideo = document.querySelector('.video-background');
    if (!heroVideo || this.loadedVideos.has('hero')) return;

    try {
      // Show loading state
      this.showVideoLoading(heroVideo);
      
      // Load the video source
      await this.loadVideoSource(heroVideo);
      
      // Set playback rate and play
      heroVideo.playbackRate = 0.25;
      await heroVideo.play();
      
      this.loadedVideos.add('hero');
      this.hideVideoLoading(heroVideo);
      
      // Only preload crumple videos on desktop devices
      if (!this.isMobile) {
        setTimeout(() => this.preloadCrumpleVideos(), 1000);
      } else {
        console.log('Mobile device detected - skipping crumple video preloading to save bandwidth');
      }
      
    } catch (error) {
      console.warn('Hero video failed to load:', error);
      this.hideVideoLoading(heroVideo);
    }
  }

  async preloadCrumpleVideos() {
    const crumpleVideos = document.querySelectorAll('.crumple-video');
    
    // Load videos one by one to avoid overwhelming the browser
    for (let i = 0; i < crumpleVideos.length; i++) {
      const video = crumpleVideos[i];
      if (!this.loadedVideos.has(video.className)) {
        try {
          await this.loadVideoSource(video);
          this.loadedVideos.add(video.className);
          
          // Small delay between loading each video
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.warn(`Crumple video ${i} failed to preload:`, error);
        }
      }
    }
  }

  loadVideoSource(video) {
    return new Promise((resolve, reject) => {
      // If video already has a source and is loaded, resolve immediately
      if (video.readyState >= 3) {
        resolve();
        return;
      }

      // Check if we need to move data-src to src
      const source = video.querySelector('source[data-src]');
      if (source && source.dataset.src) {
        source.src = source.dataset.src;
        source.removeAttribute('data-src');
      }

      // Set up event listeners
      const onLoad = () => {
        cleanup();
        resolve();
      };

      const onError = (error) => {
        cleanup();
        reject(error);
      };

      const cleanup = () => {
        video.removeEventListener('canplaythrough', onLoad);
        video.removeEventListener('error', onError);
      };

      video.addEventListener('canplaythrough', onLoad);
      video.addEventListener('error', onError);

      // Trigger video loading
      video.load();

      // Timeout after 10 seconds
      setTimeout(() => {
        cleanup();
        reject(new Error('Video load timeout'));
      }, 10000);
    });
  }

  showVideoLoading(video) {
    // Add a subtle loading indicator
    video.style.opacity = '0.3';
    
    // Create loading overlay if it doesn't exist
    let overlay = video.parentNode.querySelector('.video-loading-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'video-loading-overlay';
      overlay.innerHTML = '<div class="loading-spinner"></div>';
      video.parentNode.appendChild(overlay);
    }
    overlay.style.display = 'flex';
  }

  hideVideoLoading(video) {
    video.style.opacity = '1';
    const overlay = video.parentNode.querySelector('.video-loading-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }
}

// Initialize the lazy video loader
new LazyVideoLoader();
