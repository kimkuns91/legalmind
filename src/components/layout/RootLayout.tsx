import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="w-full min-h-screen flex flex-1 flex-col pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}
