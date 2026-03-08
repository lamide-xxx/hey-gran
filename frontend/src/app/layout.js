import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import BottomNav from "./BottomNav";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans", // Used for the font family in globals.css if needed, although tailwind v4 usually just picks up classes or global sans
});

export const metadata = {
  title: "Nana Dashboard",
  description: "A dashboard application to check on loved ones.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${plusJakartaSans.className} antialiased bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen pb-24`}
      >
        <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-xl">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
