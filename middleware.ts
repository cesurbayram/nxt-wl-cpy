import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest){
    
    const currentPath = request.nextUrl.pathname
    const isPublic = currentPath === "/sign-in"
    const token = request.cookies.get("token")?.value || ''
    if(isPublic && token.length > 0){                
        return NextResponse.redirect(new URL("/", request.nextUrl))
    }
    if(!isPublic && !(token.length > 0)){
        return NextResponse.redirect(new URL("/sign-in", request.nextUrl))
    }
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
}