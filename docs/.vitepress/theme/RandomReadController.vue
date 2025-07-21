<template>
  <div v-if="store.isActive" class="read-controller">
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
import { watch, onMounted, onUnmounted } from 'vue';
import { store, stopRandomRead } from './store.js';
import { useRouter, useData } from 'vitepress';

const router = useRouter();
const { page } = useData();
let scrollInterval = null;

const stop = () => {
  stopRandomRead();
};

const selectNextProblem = () => {
  if (store.problemList.length === 0) {
    stop();
    return;
  }

  let nextProblem;
  do {
    const randomIndex = Math.floor(Math.random() * store.problemList.length);
    nextProblem = store.problemList[randomIndex];
  } while (store.problemList.length > 1 && nextProblem.link === page.value.relativePath);

  router.go(nextProblem.link.replace('.md', '.html'));
};

let animationFrameId = null;

const startScrolling = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  let lastTime = 0;
  const animateScroll = (timestamp) => {
    if (!store.isActive) {
      cancelAnimationFrame(animationFrameId);
      return;
    }

    if (!lastTime) {
      lastTime = timestamp;
    }
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // Base speed pixels per second at speed 1
    const baseSpeed = 50;
    // Exponential growth for speed
    const scrollAmount = (baseSpeed * Math.pow(1.4, store.speed - 1) * deltaTime) / 1000;

    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    // A more robust check for the bottom of the page
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      selectNextProblem();
      return; // Stop this animation frame and wait for navigation
    }

    window.scrollBy(0, scrollAmount);
    animationFrameId = requestAnimationFrame(animateScroll);
  };

  animationFrameId = requestAnimationFrame(animateScroll);
};


onMounted(() => {
  if (store.isActive) {
    startScrolling();
  }
});

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});

watch(() => store.isActive, (isActive) => {
  if (isActive) {
    startScrolling();
  } else {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  }
});

watch(() => store.speed, () => {
  if (store.isActive) {
    startScrolling();
  }
});

// Watch for page changes to restart scrolling after navigation
watch(() => page.value.relativePath, () => {
  if (store.isActive) {
    startScrolling();
  }
});

watch(() => store.speed, () => {
  if (store.isActive) {
    startScrolling();
  }
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
  transition: transform 0.3s ease-in-out;
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