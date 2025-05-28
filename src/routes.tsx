import { createBrowserRouter } from "react-router-dom";

import { LandingPage } from "./pages/LandingPage";
import { MainLayout } from "./layouts/MainLayout";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <MainLayout />,
      children: [
        {
          index: true,
          element: <LandingPage />,
        },
      ],
    },
  ],
  { basename: "/my-web/" }
);

export default router;
