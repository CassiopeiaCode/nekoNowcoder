import DefaultTheme from 'vitepress/theme';
import { h } from 'vue';
import ProblemFilter from './ProblemFilter.vue';
import RandomReadController from './RandomReadController.vue';
import './custom.css';

export default {
  ...DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // A slot for adding components to the end of the page
      'layout-bottom': () => h(RandomReadController),
    });
  },
  enhanceApp({ app }) {
    // Register the custom component globally
    app.component('ProblemFilter', ProblemFilter);
  },
};