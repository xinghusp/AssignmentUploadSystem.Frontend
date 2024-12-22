import { createRouter, createWebHistory } from "vue-router";
import UploadPage from "../pages/UploadPage.vue";
import AssignmentsPage from "../pages/AssignmentsPage.vue";
import GradingPage from "../pages/GradingPage.vue";

const routes = [
  { path: "/", redirect: "/upload" },
  {
    path: "/upload",
    component: UploadPage,
    meta: { title: "Upload your assignment" },
  },
  { path: "/assignments", component: AssignmentsPage },
  { path: "/grading/:assignmentId", component: GradingPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title;
  }
  next();
});

export default router;
