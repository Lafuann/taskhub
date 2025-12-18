import React, { useState, type JSX } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { authService } from "../lib/services";
import axios from "axios";

type ValidationResult = {
  minLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
};

const CheckItem = ({
  valid,
  text,
}: {
  valid: boolean;
  text: string;
}): JSX.Element => (
  <div className="flex items-center gap-2 text-sm">
    <span className={valid ? "text-green-600" : "text-red-500"}>
      {valid ? "✔" : "✖"}
    </span>
    <span className={valid ? "text-green-600" : "text-gray-600"}>{text}</span>
  </div>
);

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isSuccess, setIsSuccess] = useState<{
    status: boolean | null;
    message: string;
  }>({ status: null, message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate registration - replace with actual API call
    try {
      const rsp = await authService.register(
        formData.username,
        formData.email,
        formData.password
      );
      localStorage.setItem("access_token", rsp.data.data.token);
      localStorage.setItem("user", JSON.stringify(rsp.data.data.user));

      setIsSuccess({
        status: true,
        message: "Registration is successful! Redirecting...",
      });
      setTimeout(() => navigate("/dashboard"), 3000);
    } catch (err: unknown) {
      let message = "Email atau password salah";

      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message
          ? err.response?.data?.errors.email[0]
          : message;
      }

      setIsSuccess({ status: false, message });
    } finally {
      setIsLoading(false);
    }
  };

  // helper
  const validations: ValidationResult = {
    minLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
  };

  const isPasswordValid: boolean =
    validations.minLength && validations.hasUppercase && validations.hasNumber;

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-primary-foreground"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-foreground">TaskHub+</span>
        </div>

        <h2 className="text-2xl font-bold text-foreground">
          Create an account
        </h2>
        <p className="text-muted-foreground mt-2">Get started with TaskHub+</p>
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
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

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
        <div className="mt-2 space-y-1">
          <CheckItem valid={validations.minLength} text="Min 8 characters" />
          <CheckItem
            valid={validations.hasUppercase}
            text="Contains capital letter"
          />
          <CheckItem valid={validations.hasNumber} text="Contains numbers" />
        </div>

        <button
          type="submit"
          disabled={isLoading || !isPasswordValid || isSuccess.status === true}
          className="bg-[#0cc0df] text-white px-4 py-2 rounded-xl hover:opacity-90 cursor-pointer w-full"
        >
          {isLoading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      <p className="text-center mt-6 text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-[#0cc0df] underline">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
