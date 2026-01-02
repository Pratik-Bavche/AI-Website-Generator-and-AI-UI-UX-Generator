'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Smartphone, Monitor, Loader2, Sparkles, Layout } from 'lucide-react';

export default function DesignGeneratorPage() {
    const { user } = useUser();
    const router = useRouter();
    const [prompt, setPrompt] = useState('');
    const [selectedType, setSelectedType] = useState<'app' | 'website' | null>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!prompt || !selectedType) return;

        setLoading(true);
        // Redirect to workspace
        router.push(`/design-workspace?prompt=${encodeURIComponent(prompt)}&type=${selectedType}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Header */}
            <header className="flex justify-between items-center p-6 bg-white shadow-sm border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            <Layout className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-gray-800">UI/UX Generator</h1>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {user && (
                        <div className="flex items-center gap-3">
                            <div className="text-sm text-right hidden sm:block">
                                <p className="font-medium text-gray-900">{user.fullName}</p>
                                <p className="text-xs text-gray-500">{user.primaryEmailAddress?.emailAddress}</p>
                            </div>
                            <img
                                src={user.imageUrl}
                                alt="Profile"
                                className="w-9 h-9 rounded-full border border-gray-200"
                            />
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-6 md:p-10">
                <div className="mb-10 text-center">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
                        Transform Your Idea into a Design Structure
                    </h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
                        Generate professional UI/UX breakdowns, screen hierarchies, and user flows instantly.
                    </p>
                </div>

                {/* Configuration Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-10">
                    <div className="p-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                    <div className="p-8">
                        {/* Prompt Input */}
                        <div className="mb-8">
                            <label htmlFor="prompt" className="block text-sm font-semibold text-gray-700 mb-2">
                                What do you want to design?
                            </label>
                            <div className="relative">
                                <textarea
                                    id="prompt"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g., A College Management System with student and admin portals..."
                                    className="w-full p-4 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none h-32 text-gray-700 text-base"
                                />
                                <Sparkles className="absolute top-4 left-4 w-5 h-5 text-blue-500" />
                            </div>
                        </div>

                        {/* Type Selection */}
                        <div className="mb-8">
                            <label className="block text-sm font-semibold text-gray-700 mb-4">
                                Select Platform Type
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setSelectedType('app')}
                                    className={`relative group flex items-center p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${selectedType === 'app'
                                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                        : 'border-gray-100 bg-gray-50 hover:border-blue-200 hover:bg-white'
                                        }`}
                                >
                                    <div className={`p-3 rounded-lg mr-4 ${selectedType === 'app' ? 'bg-blue-500 text-white' : 'bg-white text-gray-500 group-hover:text-blue-500 shadow-sm'}`}>
                                        <Smartphone className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className={`font-bold text-lg ${selectedType === 'app' ? 'text-blue-700' : 'text-gray-800'}`}>App UI/UX</h3>
                                        <p className="text-sm text-gray-500">Design for mobile applications (iOS/Android)</p>
                                    </div>
                                    {selectedType === 'app' && (
                                        <div className="absolute top-3 right-3 w-3 h-3 bg-blue-500 rounded-full"></div>
                                    )}
                                </button>

                                <button
                                    onClick={() => setSelectedType('website')}
                                    className={`relative group flex items-center p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${selectedType === 'website'
                                        ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                                        : 'border-gray-100 bg-gray-50 hover:border-indigo-200 hover:bg-white'
                                        }`}
                                >
                                    <div className={`p-3 rounded-lg mr-4 ${selectedType === 'website' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-500 group-hover:text-indigo-500 shadow-sm'}`}>
                                        <Monitor className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className={`font-bold text-lg ${selectedType === 'website' ? 'text-indigo-700' : 'text-gray-800'}`}>Website UI/UX</h3>
                                        <p className="text-sm text-gray-500">Design for web applications and sites</p>
                                    </div>
                                    {selectedType === 'website' && (
                                        <div className="absolute top-3 right-3 w-3 h-3 bg-indigo-500 rounded-full"></div>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Action */}
                        <button
                            onClick={handleGenerate}
                            disabled={loading || !prompt || !selectedType}
                            className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${loading || !prompt || !selectedType
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none hover:transform-none'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 cursor-pointer'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Generating Design...
                                </>
                            ) : (
                                <>
                                    Generate Design Structure
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </main>
        </div>
    );
}
