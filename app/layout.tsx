import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StateProvider } from "@/app/providers/StateProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Preweek — Pre Week Planning App",
  description: "Set intentions, nurture aspirations, and reflect on what matters.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=JSON.parse(localStorage.getItem('preweekAppState')||'{}').settings;if(s){if(s.theme==='dark')document.documentElement.classList.add('dark');var c=s.colorTheme;if(c&&c!=='warm')document.documentElement.classList.add('theme-'+c)}}catch(e){}`
          }}
        />
      </head>
    <body className="h-full bg-surface">
      <StateProvider>
        <div className="mx-auto w-full max-w-2xl xl:max-w-3xl">{children}</div>
      </StateProvider>
    </body>
    </html>
  );
}
