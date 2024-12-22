import { createApp } from "vue";
import App from "./App.vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import axios from "axios";
import router from "./router";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

const app = createApp(App);
app.use(ElementPlus);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.use(router);
app.config.globalProperties.$axios = axios;

app.config.globalProperties.$axios.defaults.baseURL =
  process.env.VUE_APP_API_BASE_URL ?? "http://localhost:5000";
app.mount("#app");
