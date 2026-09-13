import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import { ADMIN_BASE } from "./config";
import { Loading } from "./ui";
import AdminLayout from "./AdminLayout";
import Login from "./pages/Login";
import Overview from "./pages/Overview";
import Enquiries from "./pages/Enquiries";
import DemoBookings from "./pages/DemoBookings";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import ProjectEditor from "./pages/ProjectEditor";

function RequireAuth({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void">
        <Loading label="Checking session" />
      </div>
    );
  }
  if (status !== "signed-in") {
    return <Navigate to={`${ADMIN_BASE}/login`} replace state={{ from: location.pathname }} />;
  }
  return children;
}

export default function AdminRoot() {
  // Keep the console out of search results and give it its own tab title.
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    const previousTitle = document.title;
    document.title = "Admin · NeovationLabs";
    return () => {
      meta.remove();
      document.title = previousTitle;
    };
  }, []);

  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Overview />} />
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="demo-bookings" element={<DemoBookings />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/new" element={<ProjectEditor />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="projects/:id/edit" element={<ProjectEditor />} />
          <Route path="*" element={<Navigate to={ADMIN_BASE} replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
