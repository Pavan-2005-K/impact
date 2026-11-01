import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import HomePage from "../pages/HomePage";
import NotFoundPage from "../pages/NotFoundPage";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AppLayout />} path="/">
                    <Route element={<HomePage />} index />
                    <Route element={<NotFoundPage />} path="*" />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
