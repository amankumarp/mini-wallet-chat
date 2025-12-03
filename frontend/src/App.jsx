import { Routes, Route ,Navigate} from "react-router-dom";
import SetPassword from "./pages/SetPassword";
import UnlockWallet from "./pages/UnlockWallet";
import CreateWallet from "./pages/CreateWallet";
import ImportWallet from "./pages/ImportWallet";
import Dashboard from "./pages/Dashboard";
import { useApp } from "./context/AppContext";

 function ProtectedRoute({ children }) {
  const { password } = useApp();
  
  if (!password) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<UnlockWallet />} />
      <Route path="/set-password" element={<SetPassword />} />

      <Route
        path="/create-wallet"
        element={
          <ProtectedRoute>
            <CreateWallet />
          </ProtectedRoute>
        }
      />

      <Route
        path="/import-wallet"
        element={
          <ProtectedRoute>
            <ImportWallet />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
