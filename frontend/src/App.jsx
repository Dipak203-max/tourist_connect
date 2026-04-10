import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const VerifyOtp = lazy(() => import('./pages/VerifyOtp'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const TouristDashboard = lazy(() => import('./pages/TouristDashboard'));
const AiSuggestionsPage = lazy(() => import('./pages/tourist/AiSuggestionsPage'));
const GuideDashboard = lazy(() => import('./pages/GuideDashboard'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Profile = lazy(() => import('./pages/Profile'));
const StoryFeed = lazy(() => import('./pages/StoryFeed'));
const CreateStory = lazy(() => import('./pages/CreateStory'));
const GuidePublicProfile = lazy(() => import('./pages/GuidePublicProfile'));
const Chat = lazy(() => import('./pages/Chat'));
const GuideVerification = lazy(() => import('./pages/guide/GuideVerification'));
const GuideReports = lazy(() => import('./pages/guide/GuideReports'));
const AdminVerifyGuides = lazy(() => import('./pages/admin/AdminVerifyGuides'));
const GuideProfileEdit = lazy(() => import('./pages/GuideProfileEdit'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const AdminDestinations = lazy(() => import('./pages/admin/AdminDestinations'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminRequests = lazy(() => import('./pages/admin/AdminRequests'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const Notifications = lazy(() => import('./pages/Notifications'));
const TravelGroups = lazy(() => import('./pages/TravelGroups'));
const GuideDiscovery = lazy(() => import('./pages/GuideDiscovery'));
const MyItineraries = lazy(() => import('./pages/MyItineraries'));
const ItineraryPlanner = lazy(() => import('./pages/ItineraryPlanner'));
const PublicItineraryView = lazy(() => import('./pages/PublicItineraryView'));
const GuideBookings = lazy(() => import('./pages/guide/GuideBookings'));
const TouristBookings = lazy(() => import('./pages/tourist/TouristBookings'));
const BookingForm = lazy(() => import('./components/bookings/BookingForm'));
const MyFavorites = lazy(() => import('./pages/MyFavorites'));
const Destinations = lazy(() => import('./pages/destinations/Destinations'));
const DestinationDetails = lazy(() => import('./pages/destinations/DestinationDetails'));
const PaymentSuccess = lazy(() => import('./pages/payment/PaymentSuccess'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const About = lazy(() => import('./pages/About'));

import { ChatProvider } from './context/ChatContext';
import { ConnectivityProvider } from './context/ConnectivityContext';
import { FavoritesProvider } from './context/FavoritesContext';
import AdminLayout from './components/layout/AdminLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import PublicLayout from './components/layout/PublicLayout';
import { NotificationProvider } from './context/NotificationContext';
import { RealTimeProvider } from './context/RealTimeContext';
import OfflineBanner from './components/common/OfflineBanner';
import { Toaster } from 'react-hot-toast';
import PageLoader from './components/common/PageLoader';

const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <Router>
        <AuthProvider>
          <RealTimeProvider>
            <ChatProvider>
              <NotificationProvider>
                <ConnectivityProvider>
                  <FavoritesProvider>
                    <OfflineBanner />
                    <Toaster 
                      position="top-right"
                      toastOptions={{
                        className: 'glass-card dark:text-white dark:border-surface-700',
                        duration: 4000,
                      }}
                    />
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/verify-otp" element={<VerifyOtp />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />


                        {/* Public Routes */}
                        <Route path="/about" element={<About />} />
                       <Route path="/destinations" element={<PublicLayout />}>
  <Route index element={<Destinations />} />
  <Route path=":id" element={<DestinationDetails />} />
</Route>
                        <Route path="/public/itinerary/:token" element={<PublicItineraryView />} />

                        {/* ADMIN Routes */}
                        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                          <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<AdminDashboard />} />
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="verify-guides" element={<AdminVerifyGuides />} />
                            <Route path="users" element={<UserManagement />} />
                            <Route path="reports" element={<AdminReports />} />
                            <Route path="destinations" element={<AdminDestinations />} />
                            <Route path="payments" element={<AdminPayments />} />
                            <Route path="bookings" element={<AdminBookings />} />
                            <Route path="requests" element={<AdminRequests />} />
                          </Route>
                        </Route>

                        {/* GUIDE Routes */}
                        <Route element={<ProtectedRoute allowedRoles={['GUIDE']} />}>
                          <Route path="/guide" element={<DashboardLayout />}>
                            <Route index element={<GuideDashboard />} />
                            <Route path="verification" element={<GuideVerification />} />
                            <Route path="profile" element={<GuidePublicProfile />} />
                            <Route path="profile/edit" element={<GuideProfileEdit />} />
                            <Route path="groups" element={<TravelGroups />} />
                            <Route path="reports" element={<GuideReports />} />
                            <Route path="bookings" element={<GuideBookings />} />
                          </Route>
                        </Route>

                        {/* TOURIST Routes */}
                        <Route element={<ProtectedRoute allowedRoles={['TOURIST']} />}>
                          <Route path="/tourist" element={<DashboardLayout />}>
                            <Route index element={<TouristDashboard />} />
                            <Route path="ai-suggestions" element={<AiSuggestionsPage />} />
                            <Route path="bookings" element={<TouristBookings />} />
                            <Route path="book/:guideId" element={<BookingForm />} />
                          </Route>
                        </Route>

                        {/* Shared Protected Routes (Wrapped in DashboardLayout) */}
                        <Route element={<ProtectedRoute />}>
                          <Route element={<DashboardLayout />}>
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/profile/:id" element={<Profile />} />
                            <Route path="/stories" element={<StoryFeed />} />
                            <Route path="/stories/create" element={<CreateStory />} />
                            <Route path="/guide-profile/:userId" element={<GuidePublicProfile />} />
                            <Route path="/chat" element={<Chat />} />
                            <Route path="/notifications" element={<Notifications />} />
                            <Route path="/groups" element={<TravelGroups />} />
                            <Route path="/find-guides" element={<GuideDiscovery />} />
                            <Route path="/itineraries" element={<MyItineraries />} />
                            <Route path="/itineraries/:id" element={<ItineraryPlanner />} />
                            <Route path="/my-favorites" element={<MyFavorites />} />
                            <Route path="/payment/success" element={<PaymentSuccess />} />
                          </Route>
                        </Route>

                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </FavoritesProvider>
                </ConnectivityProvider>
              </NotificationProvider>
            </ChatProvider>
          </RealTimeProvider>
        </AuthProvider>
      </Router>
    );
}

export default App;
