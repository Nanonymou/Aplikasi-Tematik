import { NextResponse, type NextRequest } from "next/server";
import { GATE_COOKIE, isGateCookieValid } from "@/lib/server/gateCookie";

/**
 * Middleware autentikasi Parental Gate: rute sensitif hanya bisa diakses
 * bila ada cookie gate yang valid & belum kedaluwarsa. Kalau tidak,
 * dialihkan ke halaman tantangan dengan tujuan kembali.
 */
export async function middleware(request: NextRequest) {
  const value = request.cookies.get(GATE_COOKIE)?.value;
  if (await isGateCookieValid(value)) {
    return NextResponse.next();
  }
  const url = request.nextUrl.clone();
  url.pathname = "/gerbang-ortu";
  url.searchParams.set("ke", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

// Hanya jalan di rute sensitif (orang dewasa).
export const config = {
  matcher: ["/pengaturan/:path*", "/laporan/:path*"],
};
