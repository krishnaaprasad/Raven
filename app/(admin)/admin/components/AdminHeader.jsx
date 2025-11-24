"use client";

import { useSession, signOut } from "next-auth/react";

export default function AdminHeader() {
  const { data: session } = useSession();

  return (
    <div className="flex items-center justify-between w-full">
      
      <h1 className="text-lg font-semibold">
        Admin Panel
      </h1>

      <div className="flex items-center gap-4">
        <span className="font-medium">
          {session?.user?.name || "Admin"}
        </span>

        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-[#b28c34] text-white rounded-lg hover:bg-[#9a864c]"
        >
          Logout
        </button>
      </div>

    </div>
  );
}
