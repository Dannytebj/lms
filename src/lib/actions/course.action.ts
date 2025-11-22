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
