"use server";

import db from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { redirect } from "next/navigation";

export async function getUsers() {
  try {
    const session = await verifySession();

    if (!session?.userId) {
      redirect("/auth");
    }

    // Check if user is admin
    if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
      return { success: false, error: "Only admins can view users" };
    }

    // Fetch all users except super admins (for regular admins)
    // Super admins can see all users
    const users = await db.user.findMany({
      where:
        session.role === "SUPER_ADMIN"
          ? {}
          : {
              role: {
                notIn: ["SUPER_ADMIN"],
              },
            },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

export async function getUsersNotAssignedToCourse(courseId: string) {
  try {
    const session = await verifySession();

    if (!session?.userId) {
      redirect("/auth");
    }

    // Check if user is admin
    if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
      return { success: false, error: "Only admins can view users" };
    }

    // Check if course exists
    const course = await db.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return { success: false, error: "Course not found" };
    }

    // Get all users except those already assigned to this course
    const users = await db.user.findMany({
      where: {
        role: {
          notIn: ["SUPER_ADMIN", "ADMIN"],
        },
        assignedCourses: {
          none: {
            courseId,
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}
