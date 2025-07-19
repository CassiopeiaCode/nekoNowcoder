<template>
  <div class="problem-filter-container">
    <div class="tag-cloud">
      <span 
        v-for="tag in uniqueTags" 
        :key="tag"
        class="tag"
        :class="{ active: selectedTags.has(tag) }"
        @click="toggleTag(tag)"
      >
        {{ tag }}
      </span>
    </div>

    <div v-if="filteredProblems.length === 0" class="no-results">
      <p>没有找到符合条件的题目哦，喵~</p>
    </div>

    <ul class="problem-list">
      <li v-for="problem in filteredProblems" :key="problem.link">
        <a :href="withBase(problem.link)">{{ problem.text }}</a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { withBase } from 'vitepress';
import { sidebar } from '../sidebar.js';
import problemTags from './problemTags.json';

// All problems from the sidebar
const allProblems = ref([]);

// All unique tags
const uniqueTags = ref([]);

// Selected tags for filtering
const selectedTags = ref(new Set());

// Load initial data
onMounted(() => {
  // Extract problems from the sidebar structure
  if (sidebar && sidebar[0] && sidebar[0].items) {
    allProblems.value = sidebar[0].items;
  }

  // Calculate unique tags from the JSON file
  const tags = new Set();
  for (const pid in problemTags) {
    problemTags[pid].forEach(tag => tags.add(tag));
  }
  uniqueTags.value = Array.from(tags).sort();
});

// Toggle a tag in the selected set
const toggleTag = (tag) => {
  if (selectedTags.value.has(tag)) {
    selectedTags.value.delete(tag);
  } else {
    selectedTags.value.add(tag);
  }
  // Force reactivity update
  selectedTags.value = new Set(selectedTags.value);
};

// Filter problems based on selected tags
const filteredProblems = computed(() => {
  if (selectedTags.value.size === 0) {
    return allProblems.value;
  }

  return allProblems.value.filter(problem => {
    const problemId = problem.link.split('/').pop().replace('.md', '');
    const tagsForProblem = problemTags[problemId] || [];
    
    // Problem must have all selected tags
    return Array.from(selectedTags.value).every(selectedTag => 
      tagsForProblem.includes(selectedTag)
    );
  });
});
</script>

<style scoped>
.problem-filter-container {
  margin-top: 2rem;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.tag {
  padding: 0.3rem 0.8rem;
  border-radius: 1rem;
  background-color: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
  user-select: none;
}

.tag:hover {
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.tag.active {
  background-color: var(--vp-c-brand-1);
  color: var(--vp-c-bg-soft);
  font-weight: 600;
}

.problem-list {
  list-style-type: none;
  padding: 0;
}

.problem-list li {
  margin-bottom: 0.5rem;
}

.problem-list a {
  font-weight: 500;
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.2s;
}

.problem-list a:hover {
  color: var(--vp-c-brand-1);
}

.no-results {
  text-align: center;
  margin-top: 2rem;
  color: var(--vp-c-text-2);
}
</style>