"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"] });

function AdminLoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#fcfbf8] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#e7e1cf] max-w-md w-full text-center">
        <h1 className={`${playfair.className} text-3xl font-semibold text-[#1b180d] mb-2`}>
          Admin Gateway
        </h1>
        <p className="text-[#6b6654] mb-8 text-sm">
          Sign in to access the Raven Fragrance dashboard.
        </p>

        {error === "AccessDenied" && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-200">
            Access Denied. Your Google account is not registered as an administrator.
          </div>
        )}

        <button
          onClick={() => signIn("google", { callbackUrl: "/admin" })}
          className="w-full flex items-center justify-center gap-3 bg-[#1b180d] text-[#fcfbf8] py-3 px-4 rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </button>

        <button 
          onClick={() => router.push("/")}
          className="mt-6 text-sm text-[#9a864c] hover:underline"
        >
          Return to Store
        </button>
      </div>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fcfbf8] flex items-center justify-center text-[#9a864c]">Loading securely...</div>}>
      <AdminLoginContent />
    </Suspense>
  );
}
