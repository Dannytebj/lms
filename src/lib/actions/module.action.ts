"use server";

import db from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { redirect } from "next/navigation";

export async function getModulesByCourse(courseId: string) {
  try {
    const session = await verifySession();

    if (!session?.userId) {
      redirect("/auth");
    }

    const modules = await db.module.findMany({
      where: { courseId },
      orderBy: {
        createdAt: "asc",
      },
    });

    return { success: true, modules };
  } catch (error) {
    console.error("Error fetching modules:", error);
    return { success: false, error: "Failed to fetch modules" };
  }
}

export async function getCourseDetails(courseId: string) {
  try {
    const session = await verifySession();

    if (!session?.userId) {
      redirect("/auth");
    }

    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!course) {
      return { success: false, error: "Course not found" };
    }

    return { success: true, course };
  } catch (error) {
    console.error("Error fetching course details:", error);
    return { success: false, error: "Failed to fetch course details" };
  }
}

export async function createModule(
  courseId: string,
  title: string,
  content?: string
): Promise<{
  success: boolean;
  moduleData?: {
    id: string;
    title: string;
    content: string | null;
    courseId: string;
    createdAt: Date;
  };
  error?: string;
}> {
  try {
    const session = await verifySession();

    if (!session?.userId) {
      redirect("/auth");
    }

    if (!title.trim()) {
      return { success: false, error: "Module title is required" };
    }

    // Verify course exists
    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return { success: false, error: "Course not found" };
    }

    const moduleData = await db.module.create({
      data: {
        title: title.trim(),
        content: content?.trim() || null,
        courseId,
      },
    });

    return { success: true, moduleData };
  } catch (error) {
    console.error("Error creating module:", error);
    return { success: false, error: "Failed to create module" };
  }
}

export async function updateModule(
  moduleId: string,
  title: string,
  content?: string
): Promise<{
  success: boolean;
  moduleData?: {
    id: string;
    title: string;
    content: string | null;
    courseId: string;
    createdAt: Date;
  };
  error?: string;
}> {
  try {
    const session = await verifySession();

    if (!session?.userId) {
      redirect("/auth");
    }

    if (!title.trim()) {
      return { success: false, error: "Module title is required" };
    }

    const moduleData = await db.module.update({
      where: { id: moduleId },
      data: {
        title: title.trim(),
        content: content?.trim() || null,
      },
    });

    return { success: true, moduleData };
  } catch (error) {
    console.error("Error updating module:", error);
    return { success: false, error: "Failed to update module" };
  }
}

export async function deleteModule(
  moduleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await verifySession();

    if (!session?.userId) {
      redirect("/auth");
    }

    await db.module.delete({
      where: { id: moduleId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting module:", error);
    return { success: false, error: "Failed to delete module" };
  }
}

interface QuestionData {
  content: string;
  correctAnswerContent: string;
  answers: string[];
}

export async function createAssessment(
  moduleId: string,
  title: string,
  questions: QuestionData[]
): Promise<{ success: boolean; assessmentId?: string; error?: string }> {
  try {
    const session = await verifySession();

    if (!session?.userId) {
      redirect("/auth");
    }

    if (!title.trim()) {
      return { success: false, error: "Assessment title is required" };
    }

    if (!questions || questions.length === 0) {
      return { success: false, error: "At least one question is required" };
    }

    // Verify module exists
    const moduleData = await db.module.findUnique({ where: { id: moduleId } });
    if (!moduleData) {
      return { success: false, error: "Module not found" };
    }

    // Create assessment with questions and answers
    const assessment = await db.assesment.create({
      data: {
        title: title.trim(),
        moduleId,
        questions: {
          create: await Promise.all(
            questions.map(async (q) => {
              return {
                content: q.content.trim(),
                correctAnswer: q.correctAnswerContent.trim(),
                answers: {
                  create: q.answers.map((answer) => ({
                    content: answer.trim(),
                  })),
                },
              };
            })
          ),
        },
      },
    });

    return { success: true, assessmentId: assessment.id };
  } catch (error) {
    console.error("Error creating assessment:", error);
    return { success: false, error: "Failed to create assessment" };
  }
}

export async function getAssessmentsByModule(moduleId: string) {
  try {
    const session = await verifySession();

    if (!session?.userId) {
      redirect("/auth");
    }

    const assessments = await db.assesment.findMany({
      where: { moduleId },
      include: {
        questions: {
          include: {
            answers: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return { success: true, assessments };
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return { success: false, error: "Failed to fetch assessments" };
  }
}
