export default function Sidebar() {
  return (
    <aside className="flex flex-col w-64 p-4 bg-card-light dark:bg-card-dark border-r border-border-light dark:border-border-dark sticky top-0 h-screen">
      <div className="flex items-center gap-3 mb-8">
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDlZjhJVJxd55BqVtnYmenZGnYlnBK48ZZl-WWKjURdSJ9E-4sTyV1mIJFbNuaFGU_YrpgiMWACu0EJEuoSah9b1_JVlcFHX1ID_0PbhM0pgykl9si9mCqOOuvIYolQFf8uDpNWzFYWBFwjsV4RIsEZI7traM16UqxaKqOBMrf7lzTE0q2ChpdsIlq32vdRmNyZO5F_ixZsVKCx9qizGMCKOu3pk39zSM0SOSO8A19IaH5kABh7cY1Yi27GvvYcvHm5fmNrJ2uak2Np')",
          }}
        ></div>
        <div>
          <h1 className="text-base font-bold">Eleganza Perfumes</h1>
          <p className="text-sm text-subtle-text-light dark:text-subtle-text-dark">
            Admin Panel
          </p>
        </div>
      </div>
      <nav className="flex flex-col gap-2 flex-grow">
        {[
          ["dashboard", "Dashboard"],
          ["shopping_cart", "Orders"],
          ["inventory_2", "Products"],
          ["group", "Customers"],
          ["bar_chart", "Analytics"],
        ].map(([icon, label], i) => (
          <a
            key={i}
            href="#"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-subtle-light dark:hover:bg-subtle-dark`}
          >
            <span className="material-symbols-outlined text-2xl">{icon}</span>
            <p className="text-sm font-medium">{label}</p>
          </a>
        ))}
      </nav>
      <div>
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-subtle-light dark:hover:bg-subtle-dark"
        >
          <span className="material-symbols-outlined text-2xl">settings</span>
          <p className="text-sm font-medium">Settings</p>
        </a>
      </div>
    </aside>
  );
}
