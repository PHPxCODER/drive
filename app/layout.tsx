import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SessionWrapper from "@/components/SessionWrapper";
import { ThemeProvider } from "@/components/providers/theme-provider";
import ModalProvider from "@/components/providers/modal-provider";
import { Toaster } from "sonner";
import { UploadProvider } from "@/components/UploadProgress";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionWrapper>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="google-drive"
          >
            <Toaster position="top-center" />
            <ModalProvider />
            <UploadProvider>
            {children}</UploadProvider>
          </ThemeProvider>
        </body>
      </html>
    </SessionWrapper>
  );
}
