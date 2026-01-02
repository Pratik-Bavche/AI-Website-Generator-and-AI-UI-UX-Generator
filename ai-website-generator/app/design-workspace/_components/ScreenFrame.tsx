import React from 'react';
import { RenderComponent, ComponentData } from './RenderComponent';

interface ScreenFrameProps {
    screen: {
        id: string;
        name: string;
        type: 'mobile' | 'desktop';
        components: ComponentData[];
    };
    className?: string;
    theme?: any;
}

export const ScreenFrame: React.FC<ScreenFrameProps> = ({ screen, className, theme }) => {
    const isMobile = screen.type === 'mobile';

    // Dimensions for "Device" frame
    const frameStyle = isMobile
        ? { width: '300px', height: '600px', borderRadius: '24px', borderWidth: '8px' }
        : { width: '800px', height: '500px', borderRadius: '8px', borderWidth: '2px' };

    return (
        <div id={`screen-frame-${screen.id}`} className={`flex flex-col items-center gap-2 ${className}`}>
            <span className="font-medium text-gray-500 text-sm">{screen.name}</span>
            <div
                className="transform bg-white shadow-2xl overflow-hidden overflow-y-auto border-gray-800 scrollbar-hide"
                style={{
                    ...frameStyle,
                    borderColor: isMobile ? '#1f2937' : '#e5e7eb', // Phone bezel vs browser border
                    backgroundColor: theme?.background || '#ffffff',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}
            >
                {/* Content Area */}
                <div className="relative z-10 w-full h-full flex flex-col" style={{ color: theme?.text }}>
                    {screen.components.map((comp, idx) => (
                        <RenderComponent key={comp.id || idx} component={comp} theme={theme} />
                    ))}
                </div>
            </div>
        </div>
    );
};
