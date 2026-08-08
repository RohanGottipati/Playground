export type ErrorCode =
  | "INVALID_IMAGE"
  | "UPLOAD_FAILED"
  | "BACKBOARD_TIMEOUT"
  | "BACKBOARD_INVALID_RESPONSE"
  | "BACKBOARD_CONFIGURATION_ERROR"
  | "BACKBOARD_UNAVAILABLE"
  | "MAGIC_PATTERNS_UNAVAILABLE"
  | "SCHEMA_VALIDATION_FAILED"
  | "LEVEL_GENERATION_FAILED"
  | "LEVEL_UNREACHABLE"
  | "DATABASE_ERROR"
  | "RATE_LIMITED"
  | "NOT_FOUND"
  | "UNKNOWN_ERROR";

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  INVALID_IMAGE: 400,
  UPLOAD_FAILED: 502,
  BACKBOARD_TIMEOUT: 504,
  BACKBOARD_INVALID_RESPONSE: 502,
  BACKBOARD_CONFIGURATION_ERROR: 503,
  BACKBOARD_UNAVAILABLE: 502,
  MAGIC_PATTERNS_UNAVAILABLE: 502,
  SCHEMA_VALIDATION_FAILED: 422,
  LEVEL_GENERATION_FAILED: 500,
  LEVEL_UNREACHABLE: 500,
  DATABASE_ERROR: 500,
  RATE_LIMITED: 429,
  NOT_FOUND: 404,
  UNKNOWN_ERROR: 500,
};

const USER_MESSAGE_BY_CODE: Record<ErrorCode, string> = {
  INVALID_IMAGE:
    "That file is not a supported photo. Use a JPEG, PNG, WebP or HEIC image under 8 MB.",
  UPLOAD_FAILED:
    "The photo could not be uploaded. Check your connection and try again.",
  BACKBOARD_TIMEOUT:
    "Photo analysis took too long. Try analyzing this photo again.",
  BACKBOARD_INVALID_RESPONSE:
    "We could not understand the photo analysis. Try analyzing this photo again.",
  BACKBOARD_CONFIGURATION_ERROR:
    "Photo analysis is temporarily unavailable. Please try again later.",
  BACKBOARD_UNAVAILABLE:
    "Photo analysis is temporarily unavailable. Try again in a moment.",
  MAGIC_PATTERNS_UNAVAILABLE:
    "The design service is temporarily unavailable. Your game still generated with the built-in art style.",
  SCHEMA_VALIDATION_FAILED:
    "We could not find a clear object. Try using a well-lit photo with the object fully in frame.",
  LEVEL_GENERATION_FAILED:
    "We could not build a level from this photo. Try retaking it with fewer, clearer objects.",
  LEVEL_UNREACHABLE:
    "We could not guarantee this level was finishable. Try retaking the photo.",
  DATABASE_ERROR: "Something went wrong on our side. Please try again.",
  RATE_LIMITED: "You are going a little fast. Wait a moment and try again.",
  NOT_FOUND: "This game could not load correctly. Refresh the page or return to the arcade.",
  UNKNOWN_ERROR: "Something went wrong. Please try again.",
};

const RETRYABLE_BY_CODE: Record<ErrorCode, boolean> = {
  INVALID_IMAGE: false,
  UPLOAD_FAILED: true,
  BACKBOARD_TIMEOUT: true,
  BACKBOARD_INVALID_RESPONSE: true,
  BACKBOARD_CONFIGURATION_ERROR: false,
  BACKBOARD_UNAVAILABLE: true,
  MAGIC_PATTERNS_UNAVAILABLE: true,
  SCHEMA_VALIDATION_FAILED: false,
  LEVEL_GENERATION_FAILED: false,
  LEVEL_UNREACHABLE: false,
  DATABASE_ERROR: true,
  RATE_LIMITED: true,
  NOT_FOUND: false,
  UNKNOWN_ERROR: true,
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly userMessage: string;
  readonly retryable: boolean;
  readonly details?: unknown;

  constructor(code: ErrorCode, message?: string, details?: unknown) {
    super(message ?? code);
    this.name = "AppError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.userMessage = USER_MESSAGE_BY_CODE[code];
    this.retryable = RETRYABLE_BY_CODE[code];
    this.details = details;
  }

  toResponseBody() {
    return {
      error: {
        code: this.code,
        message: this.userMessage,
        retryable: this.retryable,
      },
    };
  }
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  return new AppError(
    "UNKNOWN_ERROR",
    error instanceof Error ? error.message : "unknown error",
  );
}
