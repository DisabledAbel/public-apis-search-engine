import "./globals.css";

export const metadata = {
  title: "Public APIs Dark Mode App",
  description: "Dark mode based on system settings"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-[#202124] dark:text-[#e8eaed]">
        {children}
      </body>
    </html>
  );
}
