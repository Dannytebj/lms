"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ModuleManager } from "@/components/module-manager";
import { getCourseDetails } from "@/lib/actions/module.action";
import { ArrowLeft, Loader2 } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date;
  modules: Array<{
    id: string;
    title: string;
    content: string | null;
    courseId: string;
    createdAt: Date;
  }>;
}

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadCourse = async () => {
      setIsLoading(true);
      try {
        const result = await getCourseDetails(courseId);
        if (result.success && result.course) {
          setCourse(result.course);
        } else {
          alert(result.error || "Failed to load course");
          router.push("/dashboard/admin/courses");
        }
      } catch (error) {
        console.error("Error loading course:", error);
        alert("Failed to load course");
        router.push("/dashboard/admin/courses");
      } finally {
        setIsLoading(false);
      }
    };

    loadCourse();
  }, [courseId, router, refreshKey]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Course not found</p>
          <Button onClick={() => router.push("/dashboard/admin/courses")}>
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/admin/courses")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      {/* Course Info */}
      <Card className="p-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{course.title}</h1>
          {course.description && (
            <p className="text-muted-foreground text-lg">{course.description}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Created on {new Date(course.createdAt).toLocaleDateString()}
          </p>
        </div>
      </Card>

      {/* Module Manager */}
      <ModuleManager
        courseId={courseId}
        modules={course.modules}
        onModulesChange={() => setRefreshKey((prev) => prev + 1)}
      />
    </div>
  );
}
