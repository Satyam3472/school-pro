"use server";

import { z } from "zod";
import { createSession, setSessionCookie, deleteSession } from '@/lib/session';
import { redirect } from "next/navigation";

const loginSchema = z.object({
  schoolId: z.string().min(1, { message: "School ID is required" }).trim(),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100)
    .trim(),
});

export async function login(prevState: any, formData: FormData) {
  try {
    const validatedFields = loginSchema.safeParse({
      schoolId: formData.get("schoolId"),
      password: formData.get("password"),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { schoolId, password } = validatedFields.data;

    // Replace with your actual user lookup
    if (schoolId !== "KidsLifeSchool" || password !== "Roshan123") {
      return {
        errors: {
          schoolId: ["Invalid School ID or Password"],
          password: ["Invalid School ID or Password"],
        },
      };
    }

    const sessionToken = await createSession("1", schoolId); // Include schoolId in session
    await setSessionCookie(sessionToken);
    
    throw redirect("/dashboard");
    
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Login error:", error);
    return {
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function logout() {
  try {
    await deleteSession();
    throw redirect("/login");
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Logout error:", error);
    throw redirect("/login");
  }
}