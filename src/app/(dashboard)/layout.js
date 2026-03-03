import ThemeToggle from "@/components/ThemeToggle";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }) {
    return (
        <div className="min-h-screen bg-[var(--background)] flex transition-colors duration-500">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 relative">
                <div className="absolute top-6 right-8 z-50">
                    <ThemeToggle />
                </div>
                <div className="max-w-6xl mx-auto pt-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
