import { BrowserRouter, Routes, Route } from "react-router-dom";
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
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
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
