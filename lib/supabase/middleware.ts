import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// セッションチェック用のCookie名
const SESSION_COOKIE = 'auth-session-timestamp';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
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

  try {
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Session check timeout')), 5000);
    });

    const sessionResult = await Promise.race([
      supabase.auth.getSession(),
      timeoutPromise
    ]) as Awaited<ReturnType<typeof supabase.auth.getSession>>;

    const user = sessionResult.data?.session?.user;
    
    // セッションタイムスタンプをチェック（1時間の有効期限）
    if (user) {
      const sessionTimestamp = request.cookies.get(SESSION_COOKIE);
      if (sessionTimestamp) {
        const timestamp = parseInt(sessionTimestamp.value);
        const currentTime = Date.now();
        const SESSION_DURATION = 60 * 60 * 1000; // 1時間
        
        // セッションが期限切れの場合
        if (currentTime - timestamp > SESSION_DURATION) {
          await supabase.auth.signOut();
          const url = request.nextUrl.clone();
          url.pathname = "/auth";
          supabaseResponse = NextResponse.redirect(url);
          supabaseResponse.cookies.delete(SESSION_COOKIE);
          return supabaseResponse;
        }
        
        // セッションが有効な場合、タイムスタンプを更新
        supabaseResponse.cookies.set(SESSION_COOKIE, currentTime.toString(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: SESSION_DURATION / 1000, // 秒単位
        });
      } else {
        // 初回ログイン時にタイムスタンプを設定
        supabaseResponse.cookies.set(SESSION_COOKIE, Date.now().toString(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60, // 1時間（秒単位）
        });
      }
    }

    // ログインが必要なルートをチェック
    const protectedRoutes = ['/dashboard']
    const publicRoutes = ['/auth']
    const isProtectedRoute = protectedRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )
    const isPublicRoute = publicRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )
    const isRootRoute = request.nextUrl.pathname === '/'

    // ユーザーが未ログインで保護されたルートにアクセスしようとした場合
    if (!user && (isProtectedRoute || isRootRoute)) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth";
      return NextResponse.redirect(url);
    }

    // ユーザーがログイン済みで認証ページにアクセスした場合
    if (user && isPublicRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch (error) {
    console.error('Middleware session check failed:', error);
    
    // エラーが発生した場合、保護されたルートなら認証ページにリダイレクト
    const protectedRoutes = ['/dashboard']
    const isProtectedRoute = protectedRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )
    const isRootRoute = request.nextUrl.pathname === '/'
    
    if (isProtectedRoute || isRootRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth";
      return NextResponse.redirect(url);
    }
    
    return supabaseResponse;
  }
}
