import { useAuth } from "./src/AuthContext";
import AuthPage from "./src/pages/AuthPage";
import BoardPage from "./src/pages/BoardPage";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#f0f2ff", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6366f1",
        fontWeight: 600, fontSize: 14
      }}>
        Starting InternTrack...
      </div>
    );
  }

  // If no user is logged in, show the login/signup page.
  // Otherwise, show the main Kanban board connected to Supabase.
  return !user ? <AuthPage /> : <BoardPage />;
}
