"use client";

import { useState, useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp, signIn } from "@/lib/actions/auth.action";

function SignInForm() {
  const [state, action, pending] = useActionState(signIn, undefined);
  const errors = state?.errors;
  const generalMessage = state?.message;
  // const generalMessage = state?.errors?.general;
  console.log("SignInForm State:", state);

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
              {errors?.email?.[0] && (
                <p className="text-sm text-red-600">{errors.email[0]}</p>
              )}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" name="password" type="password" required />
              {errors?.password?.[0] && (
                <p className="text-sm text-red-600">{errors.password[0]}</p>
              )}
            </div>
          </div>
          {generalMessage && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {generalMessage}
            </div>
          )}
          {/* {generalMessage && (
            <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {generalMessage}
            </div>
          )} */}
          <CardFooter className="flex-col gap-2 mt-6 px-0">
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Loading..." : "Login"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}

function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, undefined);
  const errors = state?.errors;
  const generalMessage = state?.message;

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Sign up to get started with your learning journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstname"
                type="text"
                placeholder="John"
                required
              />
              {errors?.firstname && (
                <p className="text-sm text-red-600">{errors.firstname}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastname"
                type="text"
                placeholder="Doe"
                required
              />
              {errors?.lastname && (
                <p className="text-sm text-red-600">{errors.lastname}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
              {errors?.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
              {state?.errors?.password && (
                <div>
                  <p>Password must:</p>
                  <ul>
                    {state.errors.password.map((error) => (
                      <li key={error}>- {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
              />
            </div>
          </div>
          {generalMessage && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {generalMessage}
            </div>
          )}
          {/* {generalMessage && (
            <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {generalMessage}
            </div>
          )} */}
          <CardFooter className="flex-col gap-2 mt-6 px-0">
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Loading..." : "Sign Up"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      {isSignUp ? <SignUpForm /> : <SignInForm />}
      <Button
        variant="link"
        onClick={() => {
          setIsSignUp(!isSignUp);
        }}
      >
        {isSignUp
          ? "Already have an account? Sign In"
          : "Don't have an account? Sign Up"}
      </Button>
    </div>
  );
}
