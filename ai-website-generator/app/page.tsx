import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ArrowRight, LayoutTemplate, Palette, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 px-10 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
            PromptUX
          </span>
        </div>
        <UserButton afterSignOutUrl="/sign-in" />
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-12 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            What would you like to <span className="text-blue-600">create</span> today?
          </h1>
          <p className="text-gray-500 text-lg md:text-xl leading-relaxed">
            Choose a workspace to get started. Build a complete website or design a comprehensive UI/UX structure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full px-4">

          {/* Card 1: Website Generator */}
          <Link href="/workspace" className="group relative bg-white rounded-3xl p-1 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="bg-white rounded-[20px] p-8 h-full flex flex-col items-start text-left border border-gray-100 group-hover:border-transparent">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                <LayoutTemplate className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-purple-700 transition-colors">Generate Website</h2>
              <p className="text-gray-500 mb-8 flex-1">
                Enter a prompt and generate a fully functional website instantly. The classic PromptUX workspace.
              </p>
              <div className="flex items-center text-purple-600 font-semibold group-hover:translate-x-1 transition-transform">
                Open Workspace <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Card 2: UI/UX Generator */}
          <Link href="/design-generator" className="group relative bg-white rounded-3xl p-1 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="bg-white rounded-[20px] p-8 h-full flex flex-col items-start text-left border border-gray-100 group-hover:border-transparent">
              <div className="w-14 h-14 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-pink-600 group-hover:text-white transition-colors duration-300">
                <Palette className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-pink-700 transition-colors">Generate UI/UX</h2>
              <p className="text-gray-500 mb-8 flex-1">
                Design user flows, app layouts, and wireframe structures for Mobile Apps and Websites based on your idea.
              </p>
              <div className="flex items-center text-pink-600 font-semibold group-hover:translate-x-1 transition-transform">
                Start Designing <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </div>
          </Link>

        </div>
      </main>

      <footer className="w-full text-center py-6 text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} PromptUX. All rights reserved.
      </footer>
    </div>
  );
}