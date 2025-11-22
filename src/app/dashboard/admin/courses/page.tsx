"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getCourses, createCourse } from "@/lib/actions/course.action";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { CourseCard } from "@/components/courseCard";

interface Course {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date;
  _count?: {
    modules: number;
    enrollments: number;
  };
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const result = await getCourses();
        if (result.success && result.courses) {
          setCourses(result.courses);
        } else {
          setError(result.error || "Failed to load courses");
        }
      } catch (err) {
        setError("An error occurred while loading courses");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError("Course title is required");
      return;
    }

    try {
      setIsCreating(true);
      const result = await createCourse(formData.title, formData.description);

      if (result.success && result.course) {
        setCourses([result.course, ...courses]);
        setFormData({ title: "", description: "" });
        setIsDialogOpen(false);
      } else {
        setError(result.error || "Failed to create course");
      }
    } catch (err) {
      setError("An error occurred while creating the course");
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 px-10 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Courses</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Course</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter course title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  disabled={isCreating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Enter course description (optional)"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  disabled={isCreating}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Course
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500 w-3/4 mx-auto">
            No courses created yet. Click the &quot;Create Course&quot; button to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => <CourseCard key={course.id} course={course} />)}
        </div>
      )}
    </div>
  );
}
