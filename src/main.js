import { createApp } from 'vue'
import App from './App.vue'
import markdownit from 'markdown-it'
import * as jsyaml from 'js-yaml'

const app = createApp(App)
app.config.globalProperties.markdownit = markdownit()
app.config.globalProperties.jsyaml = jsyaml
app.mount('#app')
