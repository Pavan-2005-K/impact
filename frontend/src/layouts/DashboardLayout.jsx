import { useState } from "react";
import { Outlet } from "react-router-dom";
import ChatbotAssistant from "../components/dashboard/ChatbotAssistant";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import { useAuth } from "../context/useAuth";

function DashboardLayout() {
    const { role } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-ivory lg:flex">
            <DashboardSidebar
                onClose={() => setSidebarOpen(false)}
                open={sidebarOpen}
                role={role}
            />
            <div className="min-w-0 flex-1">
                <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
                <main className="mx-auto w-full max-w-[90rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    <Outlet />
                </main>
            </div>
            <ChatbotAssistant />
        </div>
    );
}

export default DashboardLayout;
