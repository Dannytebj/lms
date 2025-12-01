"use client"

import { AuthForm } from "@/components/auth/AuthForm"

export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md flex flex-col">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            LMS
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Learning Management System
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
