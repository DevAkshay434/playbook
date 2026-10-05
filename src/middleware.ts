import { auth } from "@/lib/auth";

export default function proxy(req: any) {
  return (auth as any)(req);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
