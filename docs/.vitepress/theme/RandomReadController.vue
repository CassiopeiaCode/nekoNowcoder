<template>
  <div
    v-if="store.isActive"
    class="read-controller"
    :style="{ opacity: controllerOpacity }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="controller-content">
      <p>随机阅读中...</p>
      <div class="controls">
        <label for="speed-control">速度:</label>
        <input type="range" id="speed-control" min="1" max="10" v-model="store.speed" />
        <span>{{ store.speed }}</span>
        <button @click="stop">停止</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch, onMounted, onUnmounted, ref } from 'vue';
import { store, stopRandomRead, selectAndGoToNextProblem } from './store.js';
import { useRouter, useData } from 'vitepress';

const router = useRouter();
const { page } = useData();
let scrollInterval = null;

const stop = () => {
  stopRandomRead();
};

const selectNextProblem = () => {
  selectAndGoToNextProblem(router, page.value.relativePath);
};

// --- Opacity Logic ---
const controllerOpacity = ref(1);
let fadeTimeoutId = null;

const handleMouseEnter = () => {
  if (fadeTimeoutId) {
    clearTimeout(fadeTimeoutId);
    fadeTimeoutId = null;
  }
  controllerOpacity.value = 1;
};

const handleMouseLeave = () => {
  if (fadeTimeoutId) clearTimeout(fadeTimeoutId);
  fadeTimeoutId = setTimeout(() => {
    controllerOpacity.value = 0.05;
  }, 1000); // Start fading after 1s
};
// --- End Opacity Logic ---

let animationFrameId = null;
let virtualScrollY = 0; // Use a high-precision virtual scroll position

const startScrolling = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  let lastTime = 0;
  // Initialize virtualScrollY with the current actual scroll position
  virtualScrollY = window.scrollY;

  const animateScroll = (timestamp) => {
    if (!store.isActive) {
      cancelAnimationFrame(animationFrameId);
      return;
    }
    if (!lastTime) lastTime = timestamp;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // --- Sync virtual scroll with actual scroll if user intervenes ---
    const actualY = window.scrollY;
    // If the difference is significant, it means the user likely scrolled manually.
    if (Math.abs(virtualScrollY - actualY) > 10) {
      virtualScrollY = actualY; // Reset virtual position to the new actual position
    }

    // --- Recalculate physics parameters every frame for dynamic speed changes ---
    const startY = 0;
    const endY = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const totalDistance = endY - startY;
    
    // Use the precise virtualScrollY for all physics calculations
    const currentY = virtualScrollY;

    if (currentY >= endY - 1) { // -1 buffer
      selectNextProblem();
      return;
    }

    const timeEase = 2000; // 2s for acceleration/deceleration
    const maxSpeed = 10 * Math.pow(1.6, store.speed - 1);
    const acceleration = maxSpeed / (timeEase / 1000);
    const distEase = 0.5 * acceleration * Math.pow(timeEase / 1000, 2);

    let currentSpeed = 0;

    if (currentY < distEase) {
      // Acceleration phase
      currentSpeed = Math.sqrt(2 * acceleration * currentY);
    } else if (currentY >= totalDistance - distEase) {
      // Deceleration phase
      const distanceFromEnd = totalDistance - currentY;
      currentSpeed = Math.sqrt(2 * acceleration * distanceFromEnd);
    } else {
      // Uniform speed phase
      currentSpeed = maxSpeed;
    }
    
    currentSpeed = Math.max(0, Math.min(currentSpeed, maxSpeed));

    const scrollAmount = (currentSpeed * deltaTime) / 1000;
    const minScrollAmountThisFrame = 0.01;
    const finalScrollAmount = Math.max(scrollAmount, minScrollAmountThisFrame);

    // Update the virtual position with high precision
    virtualScrollY += finalScrollAmount;

    // Apply the (potentially rounded) position to the actual scroll
    window.scrollTo(0, virtualScrollY);
    animationFrameId = requestAnimationFrame(animateScroll);
  };

  animationFrameId = requestAnimationFrame(animateScroll);
};


onMounted(() => {
  if (store.isActive) {
    startScrolling();
    // Start fadeout timer automatically when component mounts and is active
    handleMouseLeave();
  }
});

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  if (fadeTimeoutId) {
    clearTimeout(fadeTimeoutId);
  }
});

watch(() => store.isActive, (isActive) => {
  if (isActive) {
    startScrolling();
    handleMouseLeave(); // Start fadeout timer when activated
  } else {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    handleMouseEnter(); // Restore opacity when stopped
  }
});

// Watch for page changes to restart scrolling after navigation
watch(() => page.value.relativePath, () => {
  if (store.isActive) {
    // Reset scroll position and start scrolling after a delay
    setTimeout(() => {
      if (store.isActive) {
        window.scrollTo(0, 0); // Go to top of the new page
        virtualScrollY = 0; // Reset virtual scroll as well
        startScrolling();
      }
    }, 500); // 500ms delay to allow page to render
  }
});

// Watch for speed changes to dynamically adjust the animation.
// No need to restart the whole animation, as parameters are recalculated on each frame.
// This watcher is kept in case we need to perform a specific action on speed change in the future.
watch(() => store.speed, () => {
  // The animation loop already picks up the new speed value, so no action is needed here.
  // This is efficient as it avoids restarting the requestAnimationFrame loop.
});
</script>

<style scoped>
.read-controller {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: opacity 1s linear, transform 0.3s ease-in-out; /* 9s transition for the fade */
}

.controller-content p {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  font-size: 0.9rem;
}

.controls {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.controls label {
  font-size: 0.85rem;
}

.controls button {
  padding: 0.2rem 0.6rem;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 15px;
  background-color: transparent;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.controls button:hover {
  background-color: var(--vp-c-brand-soft);
}
</style>