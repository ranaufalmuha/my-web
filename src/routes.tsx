import { createBrowserRouter } from "react-router-dom";

import { LandingPage } from "./pages/LandingPage";
import { MainLayout } from "./layouts/MainLayout";

const AppRoute = createBrowserRouter(
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
  { basename: "/" }
);

// const AppRoute = () => (
//   <MainLayout>
//     <Routes>
//       <Route path="/" element={<LandingPage />} />
//     </Routes>
//   </MainLayout>
// );

export default AppRoute;
