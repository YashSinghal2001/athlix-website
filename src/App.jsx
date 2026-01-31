import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import MainLayout from "./layouts/MainLayout";
import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import About from "./pages/About";
import Method from "./pages/Method";
import Success from "./pages/Success";
import Process from "./pages/Process";
import Coaching from "./pages/Coaching";
import Pricing from "./pages/Pricing";
import Apply from "./pages/Apply";

function App() {
  // Detect mobile viewport (max-width: 768px)
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 768px)").matches
  );

  useEffect(() => {
    // Listen for viewport changes
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleChange = (e) => setIsMobile(e.matches);
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Mobile: Show About on "/", Desktop: Show Home on "/" */}
          <Route path="/" element={isMobile ? <About /> : <Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/method" element={<Method />} />
          <Route path="/success" element={<Success />} />
          <Route path="/process" element={<Process />} />
          <Route path="/coaching" element={<Coaching />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/apply" element={<Apply />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
