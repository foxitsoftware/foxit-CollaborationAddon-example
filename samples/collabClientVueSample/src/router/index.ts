import { createWebHistory, createRouter } from "vue-router";
import { setIsLoading } from "@/store/isLoading";
import StartPage from "@/pages/StartPage/StartPage.vue";

const routes = [
  {
    path: "/",
    name: "StartPage",
    component: StartPage,
  },
  {
    path: "/collabCreator",
    name: "collabCreator",
    component: () => import("@/pages/CollabView/CollabView.vue"),
  },
  {
    path: "/collabParticipant",
    name: "collabParticipant",
    component: () => import("@/pages/CollabView/CollabView.vue"),
    props: true,
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  setIsLoading(true);
  next();
});

router.afterEach(() => {
  setIsLoading(false);
});

export { router };
