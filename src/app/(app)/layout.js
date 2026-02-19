import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children, title }) {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title={title} />
        <main className="p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
