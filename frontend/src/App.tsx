import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "./components/ui/sonner.tsx";
import { Toaster } from "./components/ui/toaster.tsx";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { ThemeProvider } from "./hooks/useTheme.tsx";
import Index from "./pages/Index.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import Feed from "./pages/Feed.tsx";
import Quiz from "./pages/Quiz.tsx";
//import Payment from "./pages/Payment.tsx"; -> Payment wala page poora commented out hai to kuch export nahi ho raha isliye abhi ke liye isko comment out kar diya hai, jab payment page ready ho jayega tab isko uncomment kar dena
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/quiz" element={<Quiz />} />
            {/* <Route path="/payment" element={<Payment />} /> */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
