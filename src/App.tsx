
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from './contexts/AuthProvider';
import Navbar from "./components/Layout/Navbar";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Home from "./pages/Home";
// import testProfile from "./pages/testprofile";
// import testProfile from "./pages/testprofile";
import Profile from "./pages/Profile";
import Brother from "./pages/Brother.tsx";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
// import { NotificationProvider } from "./contexts/NotificationProvider.tsx";
import Notifications from "./pages/Notifications";
import Translation from "./pages/Translation";
import { SignalRProvider } from './contexts/SignalRProvider.tsx';
import ReceiveCall from './pages/ReceiveCall';
import VideoCallScreen from "./pages/VideoCallScreen.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        {/* <NotificationProvider> */}
          <AuthProvider>
            <SignalRProvider>
              <Routes>
                <Route path="/VideoCallScreen" element={<VideoCallScreen />} />
                {/* <Route path="/receive-call" element={<ReceiveCall />} /> */}
                <Route
                  element={
                    <>
                      <Navbar />
                      <Outlet />
                    </>
                  }
                >
                <Route path="/" element={<Index />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/Profile" element={<Profile />} />
                <Route path="/Brother" element={<Brother />} />
                <Route path="/history" element={<History />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/translation" element={<Translation />} />
                <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
              <ReceiveCall />
            </SignalRProvider>
          </AuthProvider>
      </BrowserRouter>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
