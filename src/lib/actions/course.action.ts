"use server";

import db from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { redirect } from "next/navigation";

export async function getCourses() {
  try {
    const session = await verifySession();

    if (!session?.userId) {
      redirect("/auth");
    }

    const courses = await db.course.findMany({
      include: {
        _count: {
          select: { modules: true, enrollments: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, courses };
  } catch (error) {
    console.error("Error fetching courses:", error);
    return { success: false, error: "Failed to fetch courses" };
  }
}

export async function createCourse(
  title: string,
  description?: string
): Promise<{ success: boolean; course?: { id: string; title: string; description: string | null; createdAt: Date }; error?: string }> {
  try {
    const session = await verifySession();

    if (!session?.userId) {
      redirect("/auth");
    }

    if (!title.trim()) {
      return { success: false, error: "Course title is required" };
    }

    const course = await db.course.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
      },
    });

    return { success: true, course };
  } catch (error) {
    console.error("Error creating course:", error);
    return { success: false, error: "Failed to create course" };
  }
}

// ===== ADMIN COURSE ASSIGNMENT ACTIONS =====

export async function assignCourseToUser(courseId: string, userId: string) {
  try {
    const session = await verifySession();

    if (!session?.userId) {
      redirect("/auth");
    }

    // Check if user is admin
    if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
      return { success: false, error: "Only admins can assign courses" };
    }

    // Check if course exists
    const course = await db.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return { success: false, error: "Course not found" };
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Check if already assigned
    const existingAssignment = await db.courseAssignment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingAssignment) {
      return { success: false, error: "Course already assigned to this user" };
    }

    // Create assignment
    const assignment = await db.courseAssignment.create({
      data: {
        userId,
        courseId,
        assignedBy: session.userId as string,
      },
    });

    return { success: true, assignment };
  } catch (error) {
    console.error("Error assigning course:", error);
    return { success: false, error: "Failed to assign course" };
  }
}

export async function assignCourseToMultipleUsers(
  courseId: string,
  userIds: string[]
) {
  try {
    const session = await verifySession();

    if (!session?.userId) {
      redirect("/auth");
    }

    // Check if user is admin
    if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
      return { success: false, error: "Only admins can assign courses" };
    }

    // Check if course exists
    const course = await db.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return { success: false, error: "Course not found" };
    }

    // Get all users
    const users = await db.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });

    if (users.length !== userIds.length) {
      return { success: false, error: "One or more users not found" };
    }

    // Create assignments for users (skip existing ones)
    const results = await Promise.all(
      userIds.map(async (userId) => {
        try {
          return await db.courseAssignment.create({
            data: {
              userId,
              courseId,
              assignedBy: session.userId as string,
            },
          });
        } catch {
          // Skip if already assigned
          return null;
        }
      })
    );

    const successfulAssignments = results.filter((r) => r !== null);

    return {
      success: true,
      count: successfulAssignments.length,
      assignments: successfulAssignments,
    };
  } catch (error) {
    console.error("Error assigning courses to multiple users:", error);
    return { success: false, error: "Failed to assign courses" };
  }
}

export async function removeAssignment(courseId: string, userId: string) {
  try {
    const session = await verifySession();

    if (!session?.userId) {
      redirect("/auth");
    }

    // Check if user is admin
    if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
      return { success: false, error: "Only admins can remove assignments" };
    }

    // Remove assignment
    await db.courseAssignment.delete({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error removing assignment:", error);
    return { success: false, error: "Failed to remove assignment" };
  }
}

// ===== USER ENROLLMENT ACTIONS =====

export async function getAvailableCoursesForUser() {
  try {
    const session = await verifySession();

    if (!session?.userId) {
      redirect("/auth");
    }

    // Get courses assigned to this user that they haven't enrolled in yet
    const availableCourses = await db.course.findMany({
      where: {
        assignments: {
          some: {
            userId: session.userId as string,
          },
        },
        enrollments: {
          none: {
            userId: session.userId as string,
          },
        },
      },
      include: {
        _count: {
          select: { modules: true, enrollments: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, courses: availableCourses };
  } catch (error) {
    console.error("Error fetching available courses:", error);
    return { success: false, error: "Failed to fetch available courses" };
  }
}

export async function enrollInCourse(courseId: string) {
  try {
    const session = await verifySession();

    if (!session?.userId) {
      redirect("/auth");
    }

    // Check if course exists
    const course = await db.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return { success: false, error: "Course not found" };
    }

    // Check if course is assigned to user
    const assignment = await db.courseAssignment.findUnique({
      where: {
        userId_courseId: {
          userId: session.userId as string,
          courseId,
        },
      },
    });

    if (!assignment) {
      return { success: false, error: "Course not assigned to you" };
    }

    // Check if already enrolled
    const existingEnrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.userId as string,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return { success: false, error: "Already enrolled in this course" };
    }

    // Create enrollment
    const enrollment = await db.enrollment.create({
      data: {
        userId: session.userId as string,
        courseId,
      },
      include: {
        course: {
          include: {
            _count: {
              select: { modules: true, enrollments: true },
            },
          },
        },
      },
    });

    return { success: true, enrollment };
  } catch (error) {
    console.error("Error enrolling in course:", error);
    return { success: false, error: "Failed to enroll in course" };
  }
}

export async function getEnrolledCourses() {
  try {
    const session = await verifySession();

    if (!session?.userId) {
      redirect("/auth");
    }

    // Get courses user is enrolled in
    const enrolledCourses = await db.course.findMany({
      where: {
        enrollments: {
          some: {
            userId: session.userId as string,
          },
        },
      },
      include: {
        _count: {
          select: { modules: true, enrollments: true },
        },
        modules: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, courses: enrolledCourses };
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    return { success: false, error: "Failed to fetch enrolled courses" };
  }
}
