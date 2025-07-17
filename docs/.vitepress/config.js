import { defineConfig } from 'vitepress'
import { sidebar } from './sidebar.js'
import { katex } from '@mdit/plugin-katex'

const solutionPathSegment = '/docs/Solution/';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "NekoForces",
  description: "An AI-driven competitive programming solution collector.",
  base: '/',
  head: [
    [
      'link',
      { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css' }
    ],
    [
      'script',
      {},
      `
      document.addEventListener('error', (e) => {
        const target = e.target;
        if (target && target.tagName === 'IMG') {
          target.style.display = 'none';
        }
      }, true);
      `
    ],
    [
      'script',
      { type: 'text/javascript' },
      `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "s8pfa0uv88");`
    ]
  ],
  markdown: {
    config: (md) => {
      md.use(katex)
    }
  },
  vite: {
    plugins: [
      {
        name: 'escape-ai-generated-templates',
        transform(code, id) {
          if (id.includes(solutionPathSegment)) {
            // For files in the Solution directory, we escape Vue's default
            // template delimiters to prevent them from being parsed.
            const newCode = code.replace(/\{\{/g, '{\\{').replace(/\}\}/g, '}\\}');
            return { code: newCode, map: null };
          }
        }
      }
    ]
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Solutions', link: '/Solution/' }
    ],

    sidebar: sidebar,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/CassiopeiaCode/nekodeforces' }
    ]
  }
})