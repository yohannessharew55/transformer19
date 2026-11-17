/**
 * Smoothly and reliably scrolls the viewport to any section element.
 * Works across all browsers, mobile viewports, and desktop widescreen displays.
 * Retries if React is still mounting the target component and corrects for layout reflow.
 */
export const scrollToElement = (targetId: string, offset = 75, maxRetries = 15) => {
  let attempts = 0;

  const performScroll = () => {
    attempts++;
    const targetEl = document.getElementById(targetId);

    if (targetEl) {
      // Ensure scrollMarginTop is configured for native CSS scrollIntoView alignment
      targetEl.style.scrollMarginTop = `${offset}px`;

      // 1. Native scrollIntoView
      try {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (e) {}

      // 2. Computed coordinate scroll with header offset
      const rect = targetEl.getBoundingClientRect();
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const targetY = Math.max(0, rect.top + currentScroll - offset);

      window.scrollTo({ top: targetY, behavior: 'smooth' });
      if (document.documentElement) {
        document.documentElement.scrollTo({ top: targetY, behavior: 'smooth' });
      }
      if (document.body) {
        document.body.scrollTo({ top: targetY, behavior: 'smooth' });
      }

      // 3. Follow-up stabilization check (handles asynchronous chart/table layout reflow)
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          const currentRect = el.getBoundingClientRect();
          // If position drifted by more than 50px due to layout expansion
          if (Math.abs(currentRect.top - offset) > 50) {
            const curY = window.pageYOffset || document.documentElement.scrollTop || 0;
            const adjustedY = Math.max(0, currentRect.top + curY - offset);
            window.scrollTo({ top: adjustedY, behavior: 'smooth' });
          }
        }
      }, 250);

    } else if (attempts < maxRetries) {
      // If target hasn't mounted in the DOM yet, retry in 40ms
      setTimeout(performScroll, 40);
    } else {
      // Only as a last resort on maxRetries, fall back to the workspace container
      const fallbackEl = document.getElementById('workspace-container');
      if (fallbackEl) {
        fallbackEl.style.scrollMarginTop = `${offset}px`;
        try {
          fallbackEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (e) {}
      }
    }
  };

  // Wait for React to start mounting the target DOM tree
  requestAnimationFrame(() => {
    setTimeout(performScroll, 40);
  });
};
