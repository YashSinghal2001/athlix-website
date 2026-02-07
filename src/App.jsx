import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import Terms from "./pages/Terms";

function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/terms" element={<Terms />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
