"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const handleLogin = (e) => {
        e.preventDefault();
        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background-light dark:bg-background-dark">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center">
                    <div className="relative w-48 h-48 mx-auto mb-4">
                        <Image
                            src="/images/brand_artwork.png"
                            alt="Hey Gran! Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-primary">
                        HEY GRAN!
                    </h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium text-sm">
                        AI wellness check for loved ones
                    </p>
                </div>

                <form onSubmit={handleLogin} className="mt-8 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                            Username
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. julia_care"
                            className="w-full h-12 px-4 rounded-xl bg-primary/10 border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-slate-900 dark:text-slate-100"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full h-12 px-4 rounded-xl bg-primary/10 border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-slate-900 dark:text-slate-100"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full h-12 mt-4 bg-primary text-slate-900 font-bold rounded-xl shadow-md transform transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Login
                    </button>
                </form>

                <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8">
                    Helping families stay connected, one call at a time.
                </p>
            </div>
        </div>
    );
}
