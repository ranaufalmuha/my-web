import { Route, Routes } from "react-router-dom";

import { LandingPage } from "./pages/LandingPage";
import { MainLayout } from "./layouts/MainLayout";

const AppRoute = () => (
  <MainLayout>
    <Routes>
      <Route path="/" element={<LandingPage />} />
    </Routes>
  </MainLayout>
);

export default AppRoute;
