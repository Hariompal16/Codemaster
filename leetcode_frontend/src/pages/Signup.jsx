import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, NavLink } from "react-router-dom";
import { registerUser } from "../authSlice";
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  BookOpen,
  ArrowRight,
} from "lucide-react";

const signupSchema = z.object({
  firstName: z.string().min(3, "Minimum character should be 3"),
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password is too weak"),
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(registerUser(data));
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Background (non-interactive) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000 pointer-events-none" />
      </div>

      {/* Foreground Card (interactive) */}
      <div className="relative z-50 w-full max-w-md pointer-events-auto">
        <div className="relative bg-white/5 text-white rounded-2xl shadow-2xl p-8 space-y-6 overflow-hidden">
          {/* Ensure visible content sits above any decoration */}
          <div className="relative z-20 space-y-6">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-1">Join CodeMaster</h1>
              <p className="text-gray-300">Create your account and start your coding journey</p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-900 text-red-200 border border-red-500 rounded-lg px-3 py-2 text-sm text-center">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* First Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200">First Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Enter your first name"
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl transition-all duration-200 bg-transparent text-white placeholder-gray-400 ${
                      errors.firstName ? "border-red-400 bg-red-900/20" : "border-gray-700 focus:border-purple-400"
                    }`}
                    {...register("firstName")}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl transition-all duration-200 bg-transparent text-white placeholder-gray-400 ${
                      errors.emailId ? "border-red-400 bg-red-900/20" : "border-gray-700 focus:border-purple-400"
                    }`}
                    {...register("emailId")}
                  />
                </div>
                {errors.emailId && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    {errors.emailId.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className={`w-full pl-11 pr-12 py-3 border rounded-xl transition-all duration-200 bg-transparent text-white placeholder-gray-400 ${
                      errors.password ? "border-red-400 bg-red-900/20" : "border-gray-700 focus:border-purple-400"
                    }`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300 transform ${
                  loading ? "bg-gray-500 cursor-not-allowed" : "gradient-primary hover:shadow-lg active:scale-95"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Footer */}
            <div className="text-center mt-2">
              <p className="text-gray-300">
                Already have an account?{" "}
                <NavLink
                  to="/login"
                  className="font-semibold text-purple-300 hover:text-purple-200 hover:underline relative z-50"
                >
                  Sign In
                </NavLink>
              </p>
            </div>
          </div>

          {/* Any decorative accents inside the card (kept behind content) */}
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-r from-purple-600/10 to-blue-400/8 rounded-full blur-2xl opacity-30 pointer-events-none z-10" />
        </div>
      </div>
    </div>
  );
}

export default Signup;
