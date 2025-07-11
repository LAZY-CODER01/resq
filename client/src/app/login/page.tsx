"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (res?.error) {
      setErrorMsg("Invalid email or password.");
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-zinc-900 px-4">
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-xl w-full max-w-md text-gray-900 dark:text-gray-100">
        <h1 className="text-2xl font-bold mb-4 text-center">Welcome to ResQLink</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-700 dark:border-zinc-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-3 py-2 border rounded-lg pr-10 dark:bg-zinc-700 dark:border-zinc-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-blue-600 dark:text-blue-400"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </form>

        <div className="my-4 border-t border-gray-300 dark:border-zinc-600 text-center text-sm text-gray-500 dark:text-gray-400">
          or sign in with
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => signIn("google")}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg dark:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-700"
          >
            <FcGoogle className="text-xl" />
            Google
          </button>
          <button
            onClick={() => signIn("github")}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg dark:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-700"
          >
            <FaGithub className="text-xl" />
            GitHub
          </button>
        </div>

        <div className="mt-4 flex justify-between text-sm">
          <a href="/forgot-password" className="text-blue-600 dark:text-blue-400 hover:underline">
            Forgot Password?
          </a>
          <a href="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
            Create account
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}
