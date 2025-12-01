"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <main className="mx-auto w-full max-w-4xl px-6 text-center sm:px-8">
        {/* Header Section */}
        <div className="mb-12 space-y-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-6xl">
              Welcome to EduHub
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Your gateway to effective learning and course management
            </p>
          </div>
        </div>

        {/* Feature Section */}
        <div className="mb-16 grid gap-8 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-slate-800">
            <div className="mb-3 text-3xl">📚</div>
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-slate-50">
              Comprehensive Courses
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Access a wide range of educational content curated for your growth
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-slate-800">
            <div className="mb-3 text-3xl">📊</div>
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-slate-50">
              Track Progress
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Monitor your learning journey with detailed analytics and insights
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-slate-800">
            <div className="mb-3 text-3xl">✅</div>
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-slate-50">
              Assessments
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Test your knowledge with interactive quizzes and assessments
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="space-y-4">
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Ready to start your learning journey?
          </p>
          <Link href="/auth">
            <Button
              size="lg"
              className="bg-blue-600 px-8 text-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              Get Started
            </Button>
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sign in or create an account to continue
          </p>
        </div>

        {/* Footer Info */}
        <div className="mt-16 border-t border-slate-200 pt-8 dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            © 2025 EduHub. Empowering learners worldwide.
          </p>
        </div>
      </main>
    </div>
  );
}
