import Link from 'next/link';

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pb-6 pt-3 flex justify-around items-center z-50">
      <Link href="/" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary active:text-slate-900 active:dark:text-slate-100 transition-colors">
        <span className="material-symbols-outlined">home</span>
        <p className="text-[10px] font-bold leading-normal tracking-wide uppercase">Home</p>
      </Link>
      <Link href="/history" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary active:text-slate-900 active:dark:text-slate-100 transition-colors">
        <span className="material-symbols-outlined">history</span>
        <p className="text-[10px] font-bold leading-normal tracking-wide uppercase">History</p>
      </Link>
      <Link href="/loved-ones" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary active:text-slate-900 active:dark:text-slate-100 transition-colors">
        <span className="material-symbols-outlined">favorite</span>
        <p className="text-[10px] font-bold leading-normal tracking-wide uppercase">Loved Ones</p>
      </Link>
      <Link href="/settings" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary active:text-slate-900 active:dark:text-slate-100 transition-colors">
        <span className="material-symbols-outlined">settings</span>
        <p className="text-[10px] font-bold leading-normal tracking-wide uppercase">Settings</p>
      </Link>
    </nav>
  );
}
