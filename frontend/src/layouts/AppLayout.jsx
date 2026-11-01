import { Outlet } from "react-router-dom";
import AppHeader from "../components/AppHeader";

function AppLayout() {
    return (
        <div className="min-h-screen bg-ivory">
            <AppHeader />
            <main>
                <Outlet />
            </main>
            <footer className="border-t border-navy/10 px-5 py-6 text-center text-sm text-steel-blue">
                Building stronger communities, one action at a time.
            </footer>
        </div>
    );
}

export default AppLayout;
