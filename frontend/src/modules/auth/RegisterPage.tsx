import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ApiError } from "@/shared/api/client";
import { useAuth } from "@/shared/auth/AuthContext";
import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { PasswordField } from "@/modules/auth/components/PasswordField";
import { TextField } from "@/modules/auth/components/TextField";
import { SocialButtons } from "@/modules/auth/components/SocialButtons";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="size-4 animate-spin rounded-full border-2 border-white/50 border-t-white"
    />
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const errors: { name?: string; email?: string; password?: string } = {};
    if (!name.trim()) {
      errors.name = "Name is required";
    }
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      errors.email = "Enter a valid email address";
    }
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters`;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate("/today", { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(
          error.status === 409
            ? "An account with this email already exists"
            : error.message || "Something went wrong. Please try again.",
        );
      } else {
        setFormError("Unable to reach the server. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create your space 🌸"
      subtitle="Start your best life, every day"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-blossom-600">
            Sign in
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={handleSubmit} className="relative mt-6 flex flex-col gap-4.5">
        {formError ? (
          <p
            role="alert"
            className="rounded-2xl border border-danger/30 bg-blossom-50 px-4 py-3 text-sm text-danger"
          >
            {formError}
          </p>
        ) : null}

        <TextField
          label="Name"
          type="text"
          name="name"
          autoComplete="name"
          placeholder="Your name"
          icon={<UserIcon />}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name}
          required
        />

        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          icon={<EmailIcon />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          required
        />

        <PasswordField
          label="Password"
          name="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          hint="At least 8 characters"
          minLength={MIN_PASSWORD_LENGTH}
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className="mt-1.5 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-blossom-500 to-blossom-400 py-4 font-display text-base font-semibold text-white shadow-button transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? <Spinner /> : null}
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <SocialButtons />
    </AuthLayout>
  );
}
