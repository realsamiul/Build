/**
 * WebP Fallback Script
 * Checks if .webp resources exist and falls back to .jpg if not found
 */
(function() {
  'use strict';

  const fallbackExt = '.jpg';
  const webpExt = '.webp';

  /**
   * Check if a resource exists
   * @param {string} url - URL to check
   * @returns {Promise<boolean>}
   */
  function resourceExists(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  /**
   * Replace .webp extension with fallback extension, preserving query strings and hashes
   * @param {string} url - URL to convert
   * @returns {string}
   */
  function getFallbackUrl(url) {
    // Match .webp extension while preserving query strings and hash fragments
    return url.replace(/\.webp(\?[^#]*)?(\#.*)?$/i, fallbackExt + '$1$2');
  }

  /**
   * Process an image element
   * @param {HTMLImageElement} img
   */
  async function processImage(img) {
    const src = img.getAttribute('src');
    if (!src || !src.toLowerCase().endsWith(webpExt)) return;

    const exists = await resourceExists(src);
    if (!exists) {
      const fallbackSrc = getFallbackUrl(src);
      img.src = fallbackSrc;
    }

    // Handle srcset if present
    const srcset = img.getAttribute('srcset');
    if (srcset) {
      const srcsetEntries = srcset.split(',').map(entry => entry.trim());
      const processedEntries = await Promise.all(
        srcsetEntries.map(async (entry) => {
          const parts = entry.split(/\s+/);
          const url = parts[0];
          
          if (!url.toLowerCase().endsWith(webpExt)) return entry;
          
          const exists = await resourceExists(url);
          if (!exists) {
            parts[0] = getFallbackUrl(url);
          }
          return parts.join(' ');
        })
      );
      img.setAttribute('srcset', processedEntries.join(', '));
    }
  }

  /**
   * Process background images in style attributes
   * @param {Element} element
   */
  async function processStyleBackground(element) {
    const style = element.getAttribute('style');
    if (!style) return;

    const urlRegex = /url\(['"]?([^'")]+\.webp[^'"]*?)['"]?\)/gi;
    const matches = [...style.matchAll(urlRegex)];
    
    if (matches.length === 0) return;

    let updatedStyle = style;
    for (const match of matches) {
      const webpUrl = match[1];
      const exists = await resourceExists(webpUrl);
      
      if (!exists) {
        const fallbackUrl = getFallbackUrl(webpUrl);
        updatedStyle = updatedStyle.replace(match[0], `url(${fallbackUrl})`);
      }
    }
    
    if (updatedStyle !== style) {
      element.setAttribute('style', updatedStyle);
    }
  }

  /**
   * Initialize fallback checking
   */
  function init() {
    // Process all img elements with .webp sources
    const images = document.querySelectorAll('img[src*=".webp"]');
    images.forEach(processImage);

    // Process elements with background images in inline styles
    const elementsWithStyle = document.querySelectorAll('[style*="url"][style*=".webp"]');
    elementsWithStyle.forEach(processStyleBackground);

    // Set up MutationObserver for dynamically added images
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'IMG' && node.getAttribute('src')?.endsWith(webpExt)) {
              processImage(node);
            }
            if (node.getAttribute('style')?.includes('.webp')) {
              processStyleBackground(node);
            }
            // Check children
            if (node.querySelectorAll) {
              node.querySelectorAll('img[src*=".webp"]').forEach(processImage);
              node.querySelectorAll('[style*="url"][style*=".webp"]').forEach(processStyleBackground);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
