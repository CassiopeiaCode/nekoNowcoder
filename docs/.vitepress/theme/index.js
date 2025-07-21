import DefaultTheme from 'vitepress/theme';
import { h } from 'vue';
import ProblemFilter from './ProblemFilter.vue';
import RandomReadController from './RandomReadController.vue';
import { hydrateStore } from './store.js';
import './custom.css';

export default {
  ...DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // A slot for adding components to the end of the page
      'layout-bottom': () => h(RandomReadController),
    });
  },
  enhanceApp({ app, router, siteData }) {
    // Register the custom component globally
    app.component('ProblemFilter', ProblemFilter);

    // Hydrate the store from localStorage on the client side
    if (typeof window !== 'undefined') {
      hydrateStore();
    }
  },
};