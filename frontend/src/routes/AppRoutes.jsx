import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import AdminLoginPage from "../pages/AdminLoginPage";
import DashboardSectionPlaceholder from "../pages/DashboardSectionPlaceholder";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import OrganizationPendingPage from "../pages/OrganizationPendingPage";
import OrganizationRegistrationPage from "../pages/OrganizationRegistrationPage";
import RegisterChoicePage from "../pages/RegisterChoicePage";
import VolunteerRegistrationPage from "../pages/VolunteerRegistrationPage";
import VolunteerDashboardPage from "../pages/VolunteerDashboardPage";
import VolunteerCampaignsPage from "../pages/VolunteerCampaignsPage";
import VolunteerCampaignDetailsPage from "../pages/VolunteerCampaignDetailsPage";
import VolunteerProfilePage from "../pages/VolunteerProfilePage";
import VolunteerRecommendationsPage from "../pages/VolunteerRecommendationsPage";
import VolunteerApplicationsPage from "../pages/VolunteerApplicationsPage";
import VolunteerGroupsPage from "../pages/VolunteerGroupsPage";
import VolunteerTasksPage from "../pages/VolunteerTasksPage";
import VolunteerIssuesPage from "../pages/VolunteerIssuesPage";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AppLayout />} path="/">
                    <Route element={<HomePage />} index />
                    <Route element={<LoginPage />} path="login" />
                    <Route element={<AdminLoginPage />} path="admin/login" />
                    <Route element={<RegisterChoicePage />} path="register" />
                    <Route element={<VolunteerRegistrationPage />} path="register/volunteer" />
                    <Route element={<OrganizationRegistrationPage />} path="register/organization" />
                    <Route element={<ProtectedRoute allowedRole="VOLUNTEER" />} path="volunteer">
                        <Route element={<DashboardLayout />}>
                            <Route element={<VolunteerDashboardPage />} path="dashboard" />
                            <Route element={<VolunteerCampaignsPage />} path="campaigns" />
                            <Route element={<VolunteerCampaignDetailsPage />} path="campaigns/:campaignId" />
                            <Route element={<VolunteerRecommendationsPage />} path="recommendations" />
                            <Route element={<VolunteerApplicationsPage />} path="applications" />
                            <Route element={<VolunteerGroupsPage />} path="groups" />
                            <Route element={<VolunteerTasksPage />} path="tasks" />
                            <Route element={<VolunteerIssuesPage />} path="issues" />
                            <Route element={<VolunteerProfilePage />} path="profile" />
                            <Route element={<DashboardSectionPlaceholder />} path="*" />
                        </Route>
                    </Route>
                    <Route element={<ProtectedRoute allowedRole="ORGANIZATION" />} path="organization">
                        <Route element={<DashboardLayout />}>
                            <Route element={<OrganizationPendingPage />} path="pending" />
                            <Route element={<ProtectedRoute allowedRole="ORGANIZATION" approvedOrganizationOnly />}>
                                <Route element={<DashboardSectionPlaceholder />} path="dashboard" />
                                <Route element={<DashboardSectionPlaceholder />} path="*" />
                            </Route>
                        </Route>
                    </Route>
                    <Route element={<ProtectedRoute allowedRole="ADMIN" />} path="admin">
                        <Route element={<DashboardLayout />}>
                            <Route element={<DashboardSectionPlaceholder />} path="dashboard" />
                            <Route element={<DashboardSectionPlaceholder />} path="*" />
                        </Route>
                    </Route>
                    <Route element={<NotFoundPage />} path="*" />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
