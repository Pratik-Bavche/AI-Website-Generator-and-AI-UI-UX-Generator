'use client';

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { ArrowLeft, Moon, Sun, Download, RefreshCw, ZoomIn, ZoomOut, RotateCcw, Palette, Layers, Edit, Menu, FileText, LayoutDashboard } from 'lucide-react';
import { ScreenFrame } from './_components/ScreenFrame';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

// Predefined themes
const PRESETS = [
    { name: 'Default', primary: '#3b82f6', secondary: '#6366f1' },
    { name: 'Aurora', primary: '#10b981', secondary: '#3b82f6' },
    { name: 'Sunset', primary: '#f97316', secondary: '#db2777' },
    { name: 'Ocean', primary: '#0ea5e9', secondary: '#6366f1' },
    { name: 'Lavender', primary: '#8b5cf6', secondary: '#ec4899' },
];

function WorkspaceContent() {
    const searchParams = useSearchParams();
    const prompt = searchParams.get('prompt');
    const type = searchParams.get('type') || 'app';

    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [designData, setDesignData] = useState<any>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [scale, setScale] = useState(1);
    const [customTheme, setCustomTheme] = useState<any>(null);

    // Load design
    useEffect(() => {
        if (!prompt) return;
        const generateDesign = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/generate-ui-ux', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt, designType: type }),
                });
                if (!res.ok) throw new Error('Failed to generate');
                const data = await res.json();
                setDesignData(data);
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };
        generateDesign();
    }, [prompt, type]);

    // Derived theme applied to components
    const activeTheme = {
        ...(designData?.theme || {}), // Base from AI
        ...(customTheme || {}),       // User overrides
        // Dark mode overrides
        ...(isDarkMode ? {
            background: '#1f2937',
            surface: '#374151',
            text: '#f3f4f6',
            border: '#4b5563',
            muted: '#9ca3af'
        } : {})
    };

    const handleExportPDF = async () => {
        if (!designData?.screens) return;
        setExporting(true);

        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            for (let i = 0; i < designData.screens.length; i++) {
                const screen = designData.screens[i];
                const element = document.getElementById(`screen-frame-${screen.id}`);

                if (element) {
                    if (i > 0) pdf.addPage();

                    // Capture Screen
                    const dataUrl = await toPng(element, {
                        cacheBust: true,
                        // @ts-ignore
                        useCORS: true,
                        fetchRequestInit: {
                            mode: 'cors',
                        },
                        backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
                        style: { transform: 'scale(1)', transformOrigin: 'top left' }
                    });

                    // Add Title
                    pdf.setFontSize(16);
                    pdf.text(screen.name, pageWidth / 2, 20, { align: 'center' });

                    pdf.setFontSize(10);
                    pdf.setTextColor(100);
                    pdf.text(`Type: ${type} UI`, pageWidth / 2, 28, { align: 'center' });

                    // Add Image
                    const imgProps = pdf.getImageProperties(dataUrl);
                    const pdfImgWidth = type === 'app' ? 80 : 160;
                    const pdfImgHeight = (imgProps.height * pdfImgWidth) / imgProps.width;

                    // Centering
                    const x = (pageWidth - pdfImgWidth) / 2;
                    const y = 40;

                    pdf.addImage(dataUrl, 'PNG', x, y, pdfImgWidth, pdfImgHeight);
                }
            }

            pdf.save(`${designData.projectTitle || 'design'}_mockups.pdf`);

        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to export PDF. Please try again.");
        } finally {
            setExporting(false);
        }
    };

    if (!prompt) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p>No design request found.</p>
                <Link href="/design-generator"><Button variant="outline" className="mt-4">Go Back</Button></Link>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>

            {/* Top Bar */}
            <header className="h-16 border-b flex items-center justify-between px-4 lg:px-6 backdrop-blur sticky top-0 z-50 bg-opacity-90 transition-all"
                style={{ backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)', borderColor: isDarkMode ? '#1f2937' : '#e5e7eb' }}>

                {/* Left: Branding & Back */}
                <div className="flex items-center gap-3 overflow-hidden">
                    <Link href="/design-generator" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition shrink-0">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="min-w-0">
                        <h1 className="font-bold text-lg leading-tight truncate">{designData?.projectTitle || 'Generating Interface...'}</h1>
                        <p className="text-xs opacity-60 capitalize truncate hidden sm:block">{type} Design • {prompt}</p>
                    </div>
                </div>

                {/* Right: Desktop Toolbar (Hidden on Mobile) */}
                <div className="hidden md:flex items-center gap-2">
                    {/* Dashboard Link */}
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="mr-2 flex items-center gap-2 cursor-pointer">
                            <LayoutDashboard className="w-4 h-4" />
                            <span className="hidden lg:inline">Dashboard</span>
                        </Button>
                    </Link>

                    {/* Theme Presets */}
                    <div className="flex items-center gap-1 mr-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        {PRESETS.map((p) => (
                            <button
                                key={p.name}
                                onClick={() => setCustomTheme({ primary: p.primary, secondary: p.secondary })}
                                className="w-6 h-6 rounded-full border-2 border-transparent hover:scale-110 transition-transform ring-offset-2 hover:ring-2 focus:ring-2 outline-none cursor-pointer"
                                style={{ backgroundColor: p.primary }}
                                title={p.name}
                            />
                        ))}
                    </div>

                    <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)} title="Toggle Dark Mode" className="cursor-pointer">
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </Button>

                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2"></div>

                    <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={exporting} className="cursor-pointer">
                        {exporting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                        <span className="hidden lg:inline">Export PDF</span>
                    </Button>
                    <Button size="sm" disabled={loading} onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white border-none cursor-pointer">
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> <span className="hidden lg:inline">Regenerate</span>
                    </Button>
                </div>

                {/* Right: Mobile Menu (Visible on Mobile) */}
                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="w-6 h-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className={`w-[85vw] sm:w-[350px] border-l p-6 ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white'}`}>
                            <SheetTitle className="text-lg font-bold mb-4">Settings</SheetTitle>
                            <div className="flex flex-col gap-6 mt-2">
                                <div>
                                    <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider opacity-60">Actions</h3>
                                    <div className="grid gap-2">
                                        <Link href="/" className="w-full">
                                            <Button variant="outline" className="w-full justify-start cursor-pointer">
                                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                                Dashboard
                                            </Button>
                                        </Link>
                                        <Button variant="outline" className="justify-start" onClick={handleExportPDF} disabled={exporting}>
                                            {exporting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                                            Export to PDF
                                        </Button>
                                        <Button className="justify-start bg-blue-600 hover:bg-blue-700 text-white" disabled={loading} onClick={() => window.location.reload()}>
                                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Regenerate Design
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider opacity-60">Appearance</h3>
                                    <div className="flex items-center justify-between p-3 border rounded-lg mb-4">
                                        <span className="text-sm font-medium">Dark Mode</span>
                                        <div
                                            onClick={() => setIsDarkMode(!isDarkMode)}
                                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-gray-200'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </div>
                                    </div>

                                    <h4 className="text-xs font-medium mb-2 opacity-80">Color Themes</h4>
                                    <div className="grid grid-cols-5 gap-2">
                                        {PRESETS.map((p) => (
                                            <button
                                                key={p.name}
                                                onClick={() => setCustomTheme({ primary: p.primary, secondary: p.secondary })}
                                                className="aspect-square rounded-full border-2 border-transparent hover:scale-110 transition-transform ring-offset-2 focus:ring-2 outline-none w-full cursor-pointer"
                                                style={{ backgroundColor: p.primary }}
                                                title={p.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </header>

            {/* Canvas Area */}
            <main className="flex-1 overflow-auto p-10 relative cursor-grab active:cursor-grabbing">
                {/* Grid Background */}
                <div className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(${isDarkMode ? '#ffffff' : '#000000'} 1px, transparent 1px)`,
                        backgroundSize: '24px 24px'
                    }}>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full z-10 relative space-y-6">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Layers className="w-8 h-8 text-blue-500 animate-pulse" />
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-xl font-bold animate-pulse">Designing Interface Structure...</p>
                            <p className="text-gray-500">Creating screens, choosing colors, and placing components.</p>
                        </div>
                    </div>
                ) : (
                    <div
                        className="flex gap-16 items-start justify-center min-w-max pb-32 pt-10 z-10 relative transition-transform duration-300 ease-out origin-top"
                        style={{ transform: `scale(${scale})` }}
                    >
                        {designData?.screens?.map((screen: any) => (
                            <div key={screen.id} className="group relative">
                                {/* Edit Toolbar for Screen */}
                                <div className="absolute -top-10 left-0 right-0 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="font-bold text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full shadow">{screen.name}</span>
                                    <div className="flex gap-1">
                                        <Button size="icon" variant="secondary" className="h-7 w-7 rounded-full"><Edit className="w-3 h-3" /></Button>
                                        <Button size="icon" variant="secondary" className="h-7 w-7 rounded-full"><Layers className="w-3 h-3" /></Button>
                                    </div>
                                </div>

                                <ScreenFrame
                                    screen={screen}
                                    theme={activeTheme}
                                />
                            </div>
                        ))}

                        {!designData?.screens && (
                            <div className="text-center p-10 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                                <p className="text-gray-500">No layout generated. Try a different prompt.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Floating Controls */}
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 shadow-2xl rounded-full p-2 flex items-center gap-2 border dark:border-gray-700 z-50 px-4">
                <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(0.2, s - 0.1))}><ZoomOut className="w-4 h-4" /></Button>
                <span className="text-xs font-mono w-12 text-center">{Math.round(scale * 100)}%</span>
                <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(3, s + 0.1))}><ZoomIn className="w-4 h-4" /></Button>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                <Button variant="ghost" size="icon" onClick={() => setScale(1)} title="Reset View"><RotateCcw className="w-4 h-4" /></Button>
            </div>

        </div>
    );
}

export default function DesignWorkspacePage() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading Workspace...</div>}>
            <WorkspaceContent />
        </Suspense>
    );
}
