import * as z from "zod";

export const SignupFormSchema = z.object({
  firstname: z
    .string()
    .min(2, { error: "Name must be at least 2 characters long." })
    .trim(),
  lastname: z
    .string()
    .min(2, { error: "Name must be at least 2 characters long." })
    .trim(),
  email: z.email({ error: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(8, { error: "Be at least 8 characters long" })
    .regex(/[a-zA-Z]/, { error: "Contain at least one letter." })
    .regex(/[0-9]/, { error: "Contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      error: "Contain at least one special character.",
    })
    .trim(),
  confirmPassword: z
    .string()
    .trim()
    .min(8, { error: "Be at least 8 characters long" }),
}).superRefine(({ password, confirmPassword }, ctx) => {
  if (password !== confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
  }
});

export const SigninFormSchema = z.object({
  email: z.email({ error: "Please enter a valid email." }).trim(),
  password: z.string().min(8, { error: "Password is required." }).trim(),
});

export type SigninFormState =
  | {
      errors?: {
        email?: string[]
        password?: string[]
      }
      message?: string
    }
  | undefined;


export type SignupFormState =
  | {
      errors?: {
        firstname?: string[]
        lastname?: string[]
        email?: string[]
        password?: string[]
      }
      message?: string
    }
  | undefined;

export interface SessionPayload {
  userId: string;
  sessionId: string;
  expiresAt: Date;
}



// export interface SigninFormState {
//   errors?: {
//     email?: string[];
//     password?: string[];
//   };
//   message?: string;
// }

// export interface SignupFormState {
//   errors?: {
//     firstname?: string[];
//     lastname?: string[];
//     email?: string[];
//     password?: string[];
//   };
//   message?: string;
// }