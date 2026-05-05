import { createRouter, createWebHistory } from "vue-router";
import MainLayout from "@/layouts/MainLayout.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: MainLayout,
      children: [
        {
          path: "projects",
          name: "projects",
          component: () => import("@/views/ProjectsView.vue"),
        },
        {
          path: "projects/:id",
          name: "projectDetail",
          component: () => import("@/views/ProjectDetailView.vue"),
        },
        {
          path: "employees",
          name: "employees",
          component: () => import("@/views/EmployeesView.vue"),
        },
        {
          path: "companies",
          name: "companies",
          component: () => import("@/views/CompaniesView.vue"),
        },
      ],
    },
  ],
});

export default router;
