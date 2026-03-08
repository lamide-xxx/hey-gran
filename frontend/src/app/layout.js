import { Plus_Jakarta_Sans, Fredoka } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
});

export const metadata = {
  title: "Hey Gran! | AI Wellness Check for Loved Ones",
  description: "Hey Gran! provides automated AI check-in calls to ensure your elderly loved ones are safe, healthy, and happy.",
  openGraph: {
    title: "Hey Gran! | AI Wellness Check for Loved Ones",
    description: "Automated AI check-in calls to ensure your elderly loved ones are safe, healthy, and happy.",
    url: "https://hey-gran.vercel.app", // Fallback URL
    siteName: "Hey Gran!",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "Hey Gran! AI wellness check for loved ones",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hey Gran! | AI Wellness Check for Loved Ones",
    description: "Automated AI check-in calls to ensure your elderly loved ones are safe, healthy, and happy.",
    images: ["/preview.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${plusJakartaSans.className} ${fredoka.variable} antialiased bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen`}
      >
        <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-xl">
          {children}
        </div>
      </body>
    </html>
  );
}
