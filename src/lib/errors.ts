// lib/errors.ts
export class AuthError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "AuthError";
    }
  }
  
  export class ValidationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "ValidationError";
    }
  }