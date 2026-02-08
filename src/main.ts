import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './styles.css';
import 'vue-advanced-cropper/dist/style.css';

createApp(App).use(router).mount('#app');
