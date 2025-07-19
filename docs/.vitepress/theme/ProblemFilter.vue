<template>
  <div class="problem-filter-container">
    <div class="filter-layout">
      <!-- Left Column: Tags -->
      <div class="tags-column">
        <h3>标签筛选</h3>
        <div class="tag-cloud">
          <span
            v-for="tagInfo in sortedTags"
            :key="tagInfo.name"
            class="tag"
            :class="{ active: selectedTags.has(tagInfo.name) }"
            @click="toggleTag(tagInfo.name)"
          >
            {{ tagInfo.name }} ({{ tagInfo.count }})
          </span>
        </div>
      </div>

      <!-- Right Column: Problems -->
      <div class="problems-column">
        <div v-if="filteredProblems.length === 0" class="no-results">
          <p>没有找到符合条件的题目哦，喵~</p>
        </div>
        <ul v-else class="problem-list">
          <li v-for="problem in filteredProblems" :key="problem.link">
            <a :href="withBase(problem.link.replace(/\.md$/, '.html'))">{{ problem.text }}</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { withBase } from 'vitepress';
import { sidebar } from '../sidebar.js';
import problemTags from './problemTags.json';

// All problems from the sidebar
const allProblems = ref([]);

// All unique tags with counts
const sortedTags = ref([]);

// Selected tags for filtering
const selectedTags = ref(new Set());

// Load initial data
onMounted(() => {
  // Extract problems from the sidebar structure
  if (sidebar && sidebar[0] && sidebar[0].items) {
    allProblems.value = sidebar[0].items;
  }

  // Calculate unique tags and their counts from the JSON file
  const tagCounts = {};
  for (const pid in problemTags) {
    problemTags[pid].forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  }

  // Sort tags by count in descending order
  sortedTags.value = Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
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

.filter-layout {
  display: flex;
  gap: 2rem;
}

.tags-column {
  flex: 3;
  min-width: 200px;
  /* max-width: 300px; */
  border-right: 1px solid var(--vp-c-divider);
  padding-right: 2rem;
}

.tags-column h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.problems-column {
  flex: 1;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
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

@media (max-width: 768px) {
  .filter-layout {
    flex-direction: column;
  }
  .tags-column {
    border-right: none;
    border-bottom: 1px solid var(--vp-c-divider);
    padding-right: 0;
    padding-bottom: 1.5rem;
    max-width: 100%;
  }
}
</style>