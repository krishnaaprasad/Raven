import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const name = session?.user?.name || session?.user?.email?.split("@")[0] || "User"

  return (
    <section>
      <h1 className="text-4xl font-serif text-stone-900 font-bold mb-5 tracking-tight">My Account</h1>
      <div className="mb-6 text-lg">
        Hello <span className="font-bold text-[#c49939]">{name}</span>{" "}
        (not {name}?{" "}
        <a href="/api/auth/signout" className="underline text-[#ad563c] font-semibold">Log out</a>
        )
      </div>
      <p className="text-stone-600">
        From your dashboard you can view your<br />
        <Link href="/my-account/orders" className="underline text-[#ad563c] font-semibold">recent orders</Link>, manage your{" "}
        <Link href="/my-account/address" className="underline text-[#ad563c] font-semibold">addresses</Link>,
        and{" "}
        <Link href="/my-account/account-details" className="underline text-[#ad563c] font-semibold">edit your account details</Link>.
      </p>
    </section>
  )
}
