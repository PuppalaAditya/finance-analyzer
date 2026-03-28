import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import PageTransition from "./components/PageTransition";
import Home from "./pages/Home";
import Analyzer from "./pages/Analyzer";
import Chat from "./pages/Chat";
import Compare from "./pages/Compare";
import Dashboard from "./pages/Dashboard";

const App = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <Navbar />
      <main className="relative z-10">
        <Routes location={location}>
          <Route
            path="/"
            element={
              <PageTransition>
                <Home />
              </PageTransition>
            }
          />
          <Route
            path="/analyzer"
            element={
              <PageTransition>
                <Analyzer />
              </PageTransition>
            }
          />
          <Route
            path="/chat"
            element={
              <PageTransition>
                <Chat />
              </PageTransition>
            }
          />
          <Route
            path="/compare"
            element={
              <PageTransition>
                <Compare />
              </PageTransition>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PageTransition>
                <Dashboard />
              </PageTransition>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

export default App;
