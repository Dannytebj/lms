import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string | null;
    createdAt: Date;
    _count?: {
      modules: number;
      enrollments: number;
    };
  };
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/dashboard/admin/courses/${course.id}`}>
      <Card key={course.id}>
        <CardHeader>
          <CardTitle className="line-clamp-2">{course.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {course.description && (
            <p className="text-sm text-gray-600 line-clamp-3">
              {course.description}
            </p>
          )}
          <div className="flex gap-4 text-sm text-gray-500">
            <div>
              <span className="font-semibold">
                {course._count?.modules || 0}
              </span>{" "}
              Modules
            </div>
            <div>
              <span className="font-semibold">
                {course._count?.enrollments || 0}
              </span>{" "}
              Enrolled
            </div>
          </div>
          <div className="text-xs text-gray-400">
            Created {new Date(course.createdAt).toLocaleDateString()}
            {}
            {/* Created {new Date(course.createdAt).toLocaleDateString()} */}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
