import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, { status: 200, ...init });
}

export function created<T>(data: T) {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function badRequest(message: string, field?: string) {
  return NextResponse.json({ success: false, error: message, ...(field ? { field } : {}) }, { status: 400 });
}

export function unauthorized(message = "Authentication required.") {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

export function forbidden(message = "Insufficient permissions.") {
  return NextResponse.json({ success: false, error: message }, { status: 403 });
}

export function notFound(resource = "Resource") {
  return NextResponse.json({ success: false, error: `${resource} not found.` }, { status: 404 });
}

export function serverError(message = "Internal server error.") {
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}
