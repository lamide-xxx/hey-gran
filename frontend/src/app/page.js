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
            <div className="w-full max-w-sm space-y-12">
                <div className="text-center">
                    {/* Illustration Area */}
                    <div className="relative w-96 h-80 mx-auto flex flex-col items-center">
                        <div className="relative w-full h-full mb-2">
                            <Image
                                src="/images/brand_artwork_img.png"
                                alt="Hey Gran Illustration"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <h1
                            className="text-[3.5rem] font-semibold tracking-tight leading-none animate-float"
                            style={{
                                color: "#437b8d",
                                fontFamily: "var(--font-fredoka)",
                                marginTop: "-1.5rem"
                            }}
                        >
                            HeyGran!
                        </h1>
                    </div>

                    <p className="text-slate-500 dark:text-slate-400 font-bold text-lg mt-8">
                        AI wellness check for loved ones
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                            Username
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. tami_care"
                            className="w-full h-14 px-5 rounded-xl bg-primary/15 border border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full h-14 px-5 rounded-xl bg-primary/15 border border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full h-14 mt-6 bg-primary text-slate-900 font-bold text-lg rounded-xl shadow-lg transform transition-transform hover:scale-[1.03] active:scale-[0.97]"
                    >
                        Login
                    </button>
                </form>

                <p className="text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                    Helping families stay connected, one call at a time.
                </p>
            </div>
        </div>
    );
}
