import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/types";

/**
 * Middleware de Supabase: refresca la sesión y protege rutas autenticadas
 * Debe llamarse desde middleware.ts en la raíz del proyecto
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refrescar sesión — IMPORTANTE: no agregar lógica entre esto y el return
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rutas que requieren autenticación
  const rutasProtegidas = [
    "/propietario",
    "/arrendatario",
    "/configuracion",
  ];

  const esRutaProtegida = rutasProtegidas.some((ruta) =>
    request.nextUrl.pathname.startsWith(ruta)
  );

  // Redirigir a login si no hay sesión y se intenta acceder a ruta protegida
  if (!user && esRutaProtegida) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Redirigir al dashboard si ya está autenticado e intenta ir a login/registro
  if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/registro")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
