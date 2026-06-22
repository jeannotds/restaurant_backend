import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = (process.env.BACKEND_URL ?? "http://127.0.0.1:8000").replace(
  /\/$/,
  "",
);

async function fetchBackend(
  url: string,
  init: RequestInit,
): Promise<Response> {
  let res = await fetch(url, { ...init, redirect: "manual" });
  let hops = 0;

  while ([301, 302, 307, 308].includes(res.status) && hops < 5) {
    const location = res.headers.get("location");
    if (!location) break;

    let nextUrl = location;
    if (location.startsWith("http")) {
      const parsed = new URL(location);
      nextUrl = `${BACKEND_URL}${parsed.pathname}${parsed.search}`;
    } else if (location.startsWith("/")) {
      nextUrl = `${BACKEND_URL}${location}`;
    }

    res = await fetch(nextUrl, { ...init, redirect: "manual" });
    hops++;
  }

  return res;
}

async function proxy(
  request: NextRequest,
  path: string[] | undefined,
): Promise<NextResponse> {
  const segments = path ?? [];
  const pathname = segments.join("/");
  const search = request.nextUrl.search;
  const backendUrl = `${BACKEND_URL}/${pathname}${search}`;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? await request.text() : undefined;

  const res = await fetchBackend(backendUrl, {
    method: request.method,
    headers,
    body,
  });

  const data = await res.arrayBuffer();
  const responseHeaders = new Headers();
  const resContentType = res.headers.get("content-type");
  if (resContentType) responseHeaders.set("content-type", resContentType);

  return new NextResponse(data, {
    status: res.status,
    headers: responseHeaders,
  });
}

type RouteContext = { params: Promise<{ path?: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}
