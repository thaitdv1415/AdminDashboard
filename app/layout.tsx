import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexus Admin Dashboard",
  description: "SmartLock Admin System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
          <script dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    fontFamily: {
                      sans: ['Inter', 'sans-serif'],
                    },
                    colors: {
                      primary: {
                        50: '#eef2ff',
                        100: '#e0e7ff',
                        500: '#6366f1',
                        600: '#4f46e5',
                        700: '#4338ca',
                        900: '#312e81',
                      }
                    }
                  }
                }
              }
            `
          }} />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased">
        <div id="root">{children}</div>
      </body>
    </html>
  );
}