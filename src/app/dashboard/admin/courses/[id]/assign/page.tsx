"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCourseDetails } from "@/lib/actions/module.action";
import { getUsersNotAssignedToCourse } from "@/lib/actions/user.action";
import { assignCourseToMultipleUsers } from "@/lib/actions/course.action";
import { ArrowLeft, Loader2, Check } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string | null;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: Date;
}

export default function AssignCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load course details
        const courseResult = await getCourseDetails(courseId);
        if (courseResult.success && courseResult.course) {
          setCourse(courseResult.course);
        } else {
          setMessage({ type: "error", text: "Failed to load course" });
          setTimeout(() => router.push("/dashboard/admin/courses"), 2000);
          return;
        }

        // Load users not assigned to this course
        const usersResult = await getUsersNotAssignedToCourse(courseId);
        if (usersResult.success && usersResult.users) {
          setUsers(usersResult.users);
        } else {
          setMessage({ type: "error", text: usersResult.error || "Failed to load users" });
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setMessage({ type: "error", text: "Failed to load data" });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [courseId, router]);

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUserIds(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(new Set(users.map((u) => u.id)));
    } else {
      setSelectedUserIds(new Set());
    }
  };

  const handleAssign = async () => {
    if (selectedUserIds.size === 0) {
      setMessage({ type: "error", text: "Please select at least one user" });
      return;
    }

    setIsAssigning(true);
    try {
      const result = await assignCourseToMultipleUsers(
        courseId,
        Array.from(selectedUserIds)
      );

      if (result.success) {
        setMessage({
          type: "success",
          text: `Successfully assigned course to ${result.count} user(s)`,
        });
        // Remove assigned users from the list
        setUsers(users.filter((u) => !selectedUserIds.has(u.id)));
        setSelectedUserIds(new Set());

        // Redirect after success
        setTimeout(() => router.push(`/dashboard/admin/courses/${courseId}`), 1500);
      } else {
        setMessage({ type: "error", text: result.error || "Failed to assign course" });
      }
    } catch (error) {
      console.error("Error assigning course:", error);
      setMessage({ type: "error", text: "An error occurred while assigning course" });
    } finally {
      setIsAssigning(false);
    }
  };

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
          onClick={() => router.push(`/dashboard/admin/courses/${courseId}`)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      {/* Message */}
      {message && (
        <Card
          className={`p-4 ${
            message.type === "success"
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <p
            className={`text-sm ${
              message.type === "success"
                ? "text-green-800"
                : "text-red-800"
            }`}
          >
            {message.text}
          </p>
        </Card>
      )}

      {/* Course Info */}
      <Card className="p-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{course.title}</h1>
          {course.description && (
            <p className="text-muted-foreground text-lg">{course.description}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Assign this course to selected users below
          </p>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        {users.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">
              All users have already been assigned to this course
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Table Header */}
                <thead className="bg-muted border-b">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.size === users.length && users.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        aria-label="Select all users"
                        className="w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Joined
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-3">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.has(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleSelectUser(user.id);
                            } else {
                              handleSelectUser(user.id);
                            }
                          }}
                          aria-label={`Select ${user.firstName} ${user.lastName}`}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-3 text-sm font-medium">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-6 py-3 text-sm text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span className="inline-block px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Bar */}
            <div className="px-6 py-4 bg-muted border-t flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedUserIds.size} user(s) selected
              </p>
              <Button
                onClick={handleAssign}
                disabled={selectedUserIds.size === 0 || isAssigning}
                className="gap-2"
              >
                {isAssigning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Assign Course
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
