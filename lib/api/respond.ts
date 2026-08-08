import { NextResponse } from "next/server";
import { toAppError } from "@/lib/errors/AppError";
import { logError } from "@/lib/utils/logger";

export function ok<T>(body: T, status = 200): NextResponse {
  return NextResponse.json(body, { status });
}

export function failure(event: string, error: unknown): NextResponse {
  const appError = toAppError(error);
  logError(event, {
    code: appError.code,
    message: appError.message,
    details: appError.details,
  });
  return NextResponse.json(appError.toResponseBody(), { status: appError.status });
}
