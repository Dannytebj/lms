"use server";

import bcrypt from "bcrypt";
import {
  SigninFormSchema,
  SigninFormState,
  SignupFormSchema,
  SignupFormState,
} from "@/lib/definitions";
import db from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";

const AUTH_ERROR_MSG = "Bad request: check your details and try again.";

export async function signUp(
  prevState: SignupFormState | undefined,
  formData: FormData
) {
  const validatedData = SignupFormSchema.safeParse({
    firstname: formData.get("firstname"),
    lastname: formData.get("lastname"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedData.success) {
    return {
      errors: validatedData.error.flatten().fieldErrors,
    };
  }
  const { firstname, lastname, email, password } =
    validatedData.data;


  const userExists = await db.user.findUnique({
    where: { email },
  });

  if (userExists) {
    return {
       message: AUTH_ERROR_MSG
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await db.user.create({
      data: {
        email,
        firstName: firstname,
        lastName: lastname,
        password: hashedPassword,
      },
    });

    await createSession(newUser.id);
    redirect("/dashboard");
  } catch (error) {
    console.error("Error creating user:", error);
    // Re-throw redirect errors
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return {
      message: "Failed to create account",
    };
  }
}

export async function signIn(
  prevState: SigninFormState | undefined,
  formData: FormData
) {
  const validatedData = SigninFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedData.success) {
    return {
      errors: validatedData.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedData.data;

  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
         message: AUTH_ERROR_MSG,
      };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return {
        message: AUTH_ERROR_MSG
      };
    }

    await createSession(user.id);
    redirect("/dashboard");
  } catch (error) {
    console.error("Error signing in:", error);
    // Re-throw redirect errors
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return {
      message: "Failed to sign in",
    };
  }
}
