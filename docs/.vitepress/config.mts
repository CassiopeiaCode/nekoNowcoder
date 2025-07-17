import { defineConfig } from 'vitepress'
import { sidebar } from './sidebar.js'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Moe's CF Life",
  description: "An AI-powered archive of competitive programming solutions.",
  head: [['link', { rel: 'icon', href: '/logo.svg' }]],
  
  themeConfig: {
    logo: '/logo.svg',
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '主页', link: '/' },
      { text: '题解', link: '/Solution/' }, // VitePress will automatically resolve this to /Solution/index.md
      { text: '关于', link: '/about-me' }
    ],

    sidebar: sidebar,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Moe-hacker/code-forces-solution' }
    ],
    
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Moe'
    },

    search: {
      provider: 'local'
    }
  }
})
