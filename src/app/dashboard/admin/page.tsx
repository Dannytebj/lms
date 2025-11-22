"use server";

import React from "react";
import db from "@/lib/prisma";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { BookOpen, Users, Layers, TrendingUp } from "lucide-react";

async function AdminDashboard() {
  // Fetch statistics
  const [totalCourses, activeEnrollments, totalStudents, courseStats] =
    await Promise.all([
      db.course.count(),
      db.enrollment.count(),
      db.user.count({
        where: {
          role: "USER",
        },
      }),
      db.course.findMany({
        select: {
          id: true,
          title: true,
          _count: {
            select: {
              enrollments: true,
              modules: true,
            },
          },
        },
      }),
    ]);

  // Calculate additional metrics
  const coursesWithEnrollments = courseStats.filter(
    (course) => course._count.enrollments > 0
  ).length;
  const coursesWithoutEnrollments = totalCourses - coursesWithEnrollments;
  const avgEnrollmentsPerCourse =
    totalCourses > 0 ? (activeEnrollments / totalCourses).toFixed(2) : 0;
  const totalModules = courseStats.reduce(
    (sum, course) => sum + course._count.modules,
    0
  );

  return (
    <div className="w-full min-h-screen p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your LMS platform statistics and metrics
        </p>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 w-full">
        {/* Total Courses */}
        <Card className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 w-full h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardDescription>Total Courses</CardDescription>
                <CardTitle className="text-4xl mt-2">{totalCourses}</CardTitle>
              </div>
              <BookOpen className="w-12 h-12 text-blue-600 dark:text-blue-400 opacity-80" />
            </div>
          </CardHeader>
        </Card>

        {/* Total Students */}
        <Card className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 w-full h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardDescription>Total Students</CardDescription>
                <CardTitle className="text-4xl mt-2">{totalStudents}</CardTitle>
              </div>
              <Users className="w-12 h-12 text-green-600 dark:text-green-400 opacity-80" />
            </div>
          </CardHeader>
        </Card>

        {/* Active Enrollments */}
        <Card className="bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 w-full h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardDescription>Total Enrollments</CardDescription>
                <CardTitle className="text-4xl mt-2">
                  {activeEnrollments}
                </CardTitle>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-600 dark:text-purple-400 opacity-80" />
            </div>
          </CardHeader>
        </Card>

        {/* Total Modules */}
        <Card className="bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 w-full h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardDescription>Total Modules</CardDescription>
                <CardTitle className="text-4xl mt-2">{totalModules}</CardTitle>
              </div>
              <Layers className="w-12 h-12 text-orange-600 dark:text-orange-400 opacity-80" />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Secondary Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 w-full">
        {/* Courses with Enrollments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Courses with Enrollments</CardTitle>
            <div className="mt-4">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {coursesWithEnrollments}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Active courses with students
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* Courses without Enrollments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inactive Courses</CardTitle>
            <div className="mt-4">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {coursesWithoutEnrollments}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Courses with no enrollments
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* Average Enrollments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Avg Enrollments/Course</CardTitle>
            <div className="mt-4">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {avgEnrollmentsPerCourse}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Average students per course
              </p>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Detailed Course Statistics Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>
            Enrollment and module statistics per course
          </CardDescription>
        </CardHeader>
        <div className="w-full overflow-x-auto px-6 pb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold">
                  Course Title
                </th>
                <th className="text-left py-3 px-4 font-semibold">
                  Enrollments
                </th>
                <th className="text-left py-3 px-4 font-semibold">Modules</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {courseStats.length > 0 ? (
                courseStats.map((course) => (
                  <tr
                    key={course.id}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium">{course.title}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full py-1 px-3 text-xs font-semibold">
                        {course._count.enrollments}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 rounded-full py-1 px-3 text-xs font-semibold">
                        {course._count.modules}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {course._count.enrollments > 0 ? (
                        <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full py-1 px-3 text-xs font-semibold">
                          Active
                        </span>
                      ) : (
                        <span className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-full py-1 px-3 text-xs font-semibold">
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-6 px-4 text-center text-muted-foreground"
                  >
                    No courses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default AdminDashboard;
