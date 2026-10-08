import { defineApp, route } from "fels";

export const app = defineApp({
  shells: {
    public: () => import("./shells/public.tsx"),
  },
  routes: [
    route("/", () => import("./routes/home.tsx"), { render: "ssr" }),
    route("/about", () => import("./routes/about.tsx"), { render: "ssg" }),
  ],
});
