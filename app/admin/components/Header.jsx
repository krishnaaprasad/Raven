export default function Header({ onToggleTheme, theme }) {
  return (
    <header className="flex items-center justify-between border-b border-border-light dark:border-border-dark px-6 lg:px-10 py-3 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm z-10">
      <h2 className="text-lg font-bold">Dashboard Overview</h2>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col min-w-40 max-w-64">
          <div className="flex w-full items-stretch rounded-lg h-10 bg-subtle-light dark:bg-subtle-dark">
            <span className="material-symbols-outlined text-2xl px-3 flex items-center">
              search
            </span>
            <input
              className="flex-1 bg-transparent focus:outline-none text-sm"
              placeholder="Search..."
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="h-10 w-10 rounded-lg bg-subtle-light dark:bg-subtle-dark flex items-center justify-center"
          >
            {theme === "light" ? (
              <span className="material-symbols-outlined text-2xl">light_mode</span>
            ) : (
              <span className="material-symbols-outlined text-2xl">dark_mode</span>
            )}
          </button>
          <button className="h-10 w-10 rounded-lg bg-subtle-light dark:bg-subtle-dark flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">notifications</span>
          </button>
        </div>
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDaW2qV2AAYsNSqiVfH04QORnVExE1YpQbtlkypFy-sbL8XVpmLGIj7peTuRTmFom3o1k9USFretiLWMUbeW51usgRS0JpTAwodxANavQ1qOrigHNpngH7omA44D5QPdSkYMbK5ksTlRblRoycVzc6DmwZymcSs59XbQv-ZL_PE95BBDKE2zCm4rqWMAL2iRg0FP-petl9IINb8aFDgfZImQnuoP7uLOf3VvB8CrbLlT31PItUzCBgTRBh4ai7ar4LkeSTc8B0pztmb')",
          }}
        ></div>
      </div>
    </header>
  );
}
