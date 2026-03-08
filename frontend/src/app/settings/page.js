import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Nana App Settings",
};

export default function SettingsPage() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/20 p-4 flex items-center gap-4">
        <Link href="/" className="flex items-center justify-center size-10 rounded-full hover:bg-primary/20 transition-colors">
          <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">arrow_back</span>
        </Link>
        <h1 className="text-xl font-bold tracking-tight">Settings</h1>
      </header>
      
      <main className="flex-1 w-full pb-8">
        {/* Profile Section */}
        <div className="p-6 flex items-center gap-4">
          <div className="size-16 rounded-full bg-primary flex items-center justify-center overflow-hidden">
            <Image 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnLXFz85FZfu6FIgWH5E0JWKp_T6ehkQkr3YvLPq-aSQnOBDfQy4tnChOI-YKSu48PPARicShItJq5BZKtLYBckVF3dJm-U3QxEG5bcCFCYxs0t8MEiENFRDg3wswZ3AgDqZME50_86OBno8WY1-iY1cO-GkcdqVLdQwE5uS9wSt76lYgP6zGhs4s__GTsdRgfnKcHqC9PniNtcbmxKaRU6gWc1n4LVR37SGq0iDu28LnhB6RvBZisa-frGSXkgs569_JZTZdIYBw"
              alt="Profile picture" 
              width={64}
              height={64}
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <h2 className="text-lg font-bold">Nana&apos;s Account</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Premium Member</p>
          </div>
          <button className="ml-auto flex items-center justify-center size-10 rounded-full bg-primary/20 text-primary">
            <span className="material-symbols-outlined">edit</span>
          </button>
        </div>

        {/* Nana's Voice Section */}
        <section className="px-4 py-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 px-2">Nana&apos;s Voice</h3>
          
          <style dangerouslySetInnerHTML={{__html: `
            .radio-dot {
              --radio-dot-svg: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='%23ffd9b8' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='4'/%3e%3c/svg%3e");
            }
          `}} />
          
          <div className="flex flex-col gap-3 radio-dot">
            <label className="flex items-center gap-4 rounded-xl border border-primary/30 dark:border-primary/10 p-4 bg-white dark:bg-slate-800/50 cursor-pointer hover:border-primary transition-all">
              <div className="flex grow flex-col">
                <p className="text-base font-semibold">Warm &amp; Chatty</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Friendly and engaging for daily catch-ups</p>
              </div>
              <input defaultChecked className="h-6 w-6 border-2 border-primary/50 bg-transparent text-transparent checked:border-primary checked:bg-[image:var(--radio-dot-svg)] focus:outline-none focus:ring-0 focus:ring-offset-0" name="voice-style" type="radio" />
            </label>
            <label className="flex items-center gap-4 rounded-xl border border-primary/30 dark:border-primary/10 p-4 bg-white dark:bg-slate-800/50 cursor-pointer hover:border-primary transition-all">
              <div className="flex grow flex-col">
                <p className="text-base font-semibold">Calm &amp; Gentle</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Soothing and peaceful for quiet evenings</p>
              </div>
              <input className="h-6 w-6 border-2 border-primary/50 bg-transparent text-transparent checked:border-primary checked:bg-[image:var(--radio-dot-svg)] focus:outline-none focus:ring-0 focus:ring-offset-0" name="voice-style" type="radio" />
            </label>
            <label className="flex items-center gap-4 rounded-xl border border-primary/30 dark:border-primary/10 p-4 bg-white dark:bg-slate-800/50 cursor-pointer hover:border-primary transition-all">
              <div className="flex grow flex-col">
                <p className="text-base font-semibold">Cheerful &amp; Upbeat</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Bright and energetic to start the day</p>
              </div>
              <input className="h-6 w-6 border-2 border-primary/50 bg-transparent text-transparent checked:border-primary checked:bg-[image:var(--radio-dot-svg)] focus:outline-none focus:ring-0 focus:ring-offset-0" name="voice-style" type="radio" />
            </label>
          </div>
        </section>

        {/* Notification Preferences */}
        <section className="px-4 py-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 px-2">Notifications</h3>
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-primary/20 divide-y divide-primary/10 overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">notifications</span>
                <span className="font-medium">Push Notifications</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input defaultChecked className="sr-only peer" type="checkbox" />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">mail</span>
                <span className="font-medium">Email Daily Recap</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input className="sr-only peer" type="checkbox" />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Account Settings */}
        <section className="px-4 py-2 mb-10">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 px-2">Account</h3>
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-primary/20 divide-y divide-primary/10 overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 text-left hover:bg-primary/10 transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-500">lock</span>
                <span className="font-medium">Privacy &amp; Security</span>
              </div>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 text-left hover:bg-primary/10 transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-500">payments</span>
                <span className="font-medium">Subscription Plan</span>
              </div>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">logout</span>
                <span className="font-medium">Sign Out</span>
              </div>
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
