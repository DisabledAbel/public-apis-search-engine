import "./globals.css";

export const metadata = {
  title: "Dark Mode App",
  description: "Dark mode based on system settings"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-black text-black dark:text-white">
        {children}
      </body>
    </html>
  );
}
