import DefaultTheme from 'vitepress/theme';
import ProblemFilter from './ProblemFilter.vue';
import './custom.css';

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    // Register the custom component globally
    app.component('ProblemFilter', ProblemFilter);
  }
};