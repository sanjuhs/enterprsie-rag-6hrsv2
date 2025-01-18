import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Image
              src="/database-icon.png"
              alt="DB Play AI Logo"
              width={32}
              height={32}
              className="dark:invert"
            />
            <span className="text-xl font-bold">DB Play AI</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-20">
          <div className="flex flex-col items-center text-center">
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Master Your Database Skills with{" "}
              <span className="text-primary">AI-Powered Learning</span>
            </h1>
            <p className="mb-12 max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Experience hands-on database learning with our interactive
              playground. Practice SQL queries, understand database design, and
              get real-time AI assistance.
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/demo">Try Demo</Link>
              </Button>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm"
              >
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} DB Play AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "Interactive SQL Playground",
    description:
      "Practice SQL queries in real-time with our interactive environment. Get immediate feedback and results.",
  },
  {
    title: "AI-Powered Assistance",
    description:
      "Get intelligent suggestions and explanations from our AI assistant as you learn and practice.",
  },
  {
    title: "Real Database Experience",
    description:
      "Work with real database scenarios and learn best practices for database management and optimization.",
  },
  {
    title: "Structured Learning Path",
    description:
      "Follow a carefully designed curriculum that takes you from basics to advanced database concepts.",
  },
  {
    title: "Performance Analytics",
    description:
      "Track your progress and identify areas for improvement with detailed performance metrics.",
  },
  {
    title: "Community Support",
    description:
      "Join a community of learners and experts to share knowledge and get help when needed.",
  },
];
