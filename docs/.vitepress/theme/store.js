import { reactive, watch } from 'vue';

const STORE_KEY = 'randomReadState';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Returns a default, clean state. No localStorage access here.
const getInitialState = () => ({
  isActive: false,
  speed: 5,
  problemList: [],
  problemStats: [],
  lastReadTimestamp: 0,
});

export const store = reactive(getInitialState());

// This function should be called only on the client side.
export function hydrateStore() {
  const savedState = localStorage.getItem(STORE_KEY);
  if (savedState) {
    try {
      const parsedState = JSON.parse(savedState);
      store.isActive = parsedState.isActive || false;
      store.speed = typeof parsedState.speed === 'number' ? parsedState.speed : 5;
      store.problemStats = Array.isArray(parsedState.problemStats) ? parsedState.problemStats : [];
      store.lastReadTimestamp = typeof parsedState.lastReadTimestamp === 'number' ? parsedState.lastReadTimestamp : 0;
    } catch (e) {
      console.error("Failed to parse or hydrate randomReadState from localStorage", e);
    }
  }
}

// Watch relevant state and persist to localStorage
watch(() => ({
  isActive: store.isActive,
  speed: store.speed,
  problemStats: store.problemStats,
  lastReadTimestamp: store.lastReadTimestamp,
}), (newState) => {
  // Create a serializable copy without the full problemList
  const stateToSave = {
    isActive: newState.isActive,
    speed: newState.speed,
    problemStats: newState.problemStats,
    lastReadTimestamp: newState.lastReadTimestamp,
  };
  localStorage.setItem(STORE_KEY, JSON.stringify(stateToSave));
}, { deep: true });


export function startRandomRead(problems) {
  const now = Date.now();
  // Check if the last session was more than a day ago
  if (now - store.lastReadTimestamp > ONE_DAY_MS) {
    store.problemStats = []; // Reset stats if expired
  }

  store.problemList = problems.map(p => ({ text: p.text, link: p.link }));

  // Sync problemStats with the current problemList
  const currentLinks = new Set(store.problemList.map(p => p.link));
  // Filter out stats for problems that are no longer in the list
  store.problemStats = store.problemStats.filter(stat => currentLinks.has(stat.link));
  // Add new problems to stats
  store.problemList.forEach(p => {
    if (!store.problemStats.some(stat => stat.link === p.link)) {
      store.problemStats.push({ link: p.link, count: 0 });
    }
  });

  store.isActive = true;
  store.lastReadTimestamp = now;
}

export function incrementProblemCount(link) {
    const stat = store.problemStats.find(s => s.link === link);
    if (stat) {
        stat.count++;
    }
    store.lastReadTimestamp = Date.now();
}

export function stopRandomRead() {
  store.isActive = false;
  // Don't clear problemList here, it might be needed for the next start
}

export function selectAndGoToNextProblem(router, currentPageRelativePath = '') {
  if (store.problemList.length === 0) {
    stopRandomRead();
    return;
  }

  // Get stats for the problems currently in the list
  const relevantStats = store.problemStats.filter(stat =>
    store.problemList.some(p => p.link === stat.link)
  );

  if (relevantStats.length === 0) {
    // This case should ideally not happen if startRandomRead is called correctly
    const randomIndex = Math.floor(Math.random() * store.problemList.length);
    const randomProblem = store.problemList[randomIndex];
    incrementProblemCount(randomProblem.link);
    router.go(randomProblem.link.replace('.md', '.html'));
    return;
  }

  // Find the minimum visit count
  const minCount = Math.min(...relevantStats.map(stat => stat.count));

  // Filter for all problems with that minimum count
  let candidates = relevantStats.filter(stat => stat.count === minCount);

  // If there's more than one candidate and we are on one of them, remove it to avoid staying on the same page
  if (candidates.length > 1) {
    candidates = candidates.filter(stat => stat.link !== currentPageRelativePath);
  }
  
  // If filtering leaves no candidates (e.g., all min-count pages are the current one), reset to all min-count pages
  if (candidates.length === 0) {
      candidates = relevantStats.filter(stat => stat.count === minCount);
  }

  // Select a random problem from the candidates
  const randomIndex = Math.floor(Math.random() * candidates.length);
  const nextProblemStat = candidates[randomIndex];
  
  incrementProblemCount(nextProblemStat.link);
  router.go(nextProblemStat.link.replace('.md', '.html'));
}