import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      <Topbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
      <footer className="border-t border-gray-200 bg-white px-6 py-3">
        <p className="text-xs text-gray-500 text-center">
          © {new Date().getFullYear()} SGBras. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}