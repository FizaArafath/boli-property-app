"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { isAuthenticated, ready, login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in -> go straight to the dashboard
  useEffect(() => {
    if (ready && isAuthenticated) router.replace("/dashboard");
  }, [ready, isAuthenticated, router]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = "Username is required";
    if (!form.password) e.password = "Password is required";
    return e;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    setLoading(true);
    try {
      await login(form.username.trim(), form.password);
      router.replace("/dashboard");
    } catch (err) {
      setApiError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={onSubmit} noValidate>
        <h1>Sign in</h1>

        {apiError && <div className="alert" role="alert">{apiError}</div>}

        <label htmlFor="username">Username</label>
        <input id="username" name="username" value={form.username} onChange={onChange} autoComplete="username" />
        {errors.username && <span className="field-error">{errors.username}</span>}

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" value={form.password} onChange={onChange} autoComplete="current-password" />
        {errors.password && <span className="field-error">{errors.password}</span>}

        <button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
        <p className="hint">Demo: admin / password123</p>
      </form>
    </div>
  );
}
