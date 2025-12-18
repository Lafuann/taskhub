import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { authService } from "../lib/services";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<{
    status: boolean | null;
    message: string;
  }>({ status: null, message: "" });
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const rsp = await authService.login(formData.email, formData.password);

      localStorage.setItem("access_token", rsp.data.data.token);
      localStorage.setItem("user", JSON.stringify(rsp.data.data.user));

      setIsSuccess({
        status: true,
        message: "Login successful! Redirecting...",
      });
      setTimeout(() => navigate("/dashboard"), 3000);
    } catch (err: unknown) {
      let message = "Email atau password salah";

      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message ?? message;
      }

      setIsSuccess({ status: false, message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 bg-[#0cc0df]  rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-black"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-black">TaskHub+</span>
        </div>

        <h2 className="md:block hidden text-2xl font-bold text-black">
          TaskHub+
        </h2>
        <p className="text-muted-foreground mt-2">
          Sign In to your account to continue
        </p>
      </div>

      {isSuccess.message && (
        <div
          className={`${
            isSuccess.status
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          } px-4 py-3 rounded-md mb-4`}
        >
          {isSuccess.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              {showPassword ? (
                <FaEyeSlash className="text-gray-700 hover:opacity-70 active:black" />
              ) : (
                <FaEye className="text-gray-700 hover:opacity-70 active:black" />
              )}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || isSuccess.status === true}
          className="bg-[#0cc0df] text-white px-4 py-2 rounded-xl hover:opacity-90 cursor-pointer w-full"
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <p className="text-center mt-6 text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/register" className="text-[#0cc0df] underline">
          Sign Up
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
