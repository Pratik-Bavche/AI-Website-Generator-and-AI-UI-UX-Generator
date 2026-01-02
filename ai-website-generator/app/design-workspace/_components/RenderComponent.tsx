import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as LucideIcons from 'lucide-react';

const Icons: any = LucideIcons;

export type ComponentData = {
    id: string;
    type: string;
    props?: any;
    style?: any;
};

interface RenderComponentProps {
    component: ComponentData;
    theme?: any; // Pass theme down for styling
}

export const RenderComponent: React.FC<RenderComponentProps> = ({ component, theme }) => {
    const { type, props, style } = component;
    const Icon = props?.icon && Icons[props.icon] ? Icons[props.icon] : null;

    // Helper to resolve button variant to tailwind classes or shadcn variants
    // For dynamic primary color, ideally we use inline styles for specifics or CSS vars.
    // Here we will use inline styles heavily for dynamic coloring.

    const primaryColor = theme?.primary || '#3b82f6';
    const secondaryColor = theme?.secondary || '#6366f1';
    const textColor = theme?.text || '#1f2937';
    const surfaceColor = theme?.surface || '#ffffff';

    switch (type) {
        case 'Navbar':
            return (
                <div
                    className="flex items-center justify-between p-4 shadow-sm border-b"
                    style={{
                        backgroundColor: surfaceColor,
                        borderColor: theme?.border || '#e5e7eb',
                        color: textColor,
                        ...style
                    }}
                >
                    <div className="font-bold text-lg">{props?.title || 'Brand'}</div>
                    <div className="flex gap-3">
                        {/* Render actions if any */}
                        {props?.actions?.map((act: any, idx: number) => (
                            <Button key={idx} size="sm" variant="ghost">
                                {act.label}
                            </Button>
                        ))}
                        {Icon && (
                            <Button size="icon" variant="ghost">
                                <Icon className="w-5 h-5" />
                            </Button>
                        )}
                    </div>
                </div>
            );

        case 'Hero':
            return (
                <div
                    className="p-8 text-center rounded-lg m-2 relative overflow-hidden"
                    style={{
                        background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)`,
                        color: textColor
                    }}
                >
                    <h2 className="text-2xl font-bold mb-2">{props?.title || 'Welcome'}</h2>
                    <p className="mb-6 opacity-80">{props?.subtitle || 'Subtitle goes here'}</p>
                    <Button
                        style={{ backgroundColor: primaryColor, color: '#fff' }}
                        className="hover:opacity-90"
                    >
                        {props?.action || 'Get Started'}
                    </Button>
                </div>
            );

        case 'Form':
            return (
                <div className="p-4 space-y-4" style={{ backgroundColor: surfaceColor }}>
                    {props?.inputs?.map((inp: any, idx: number) => (
                        <div key={idx} className="space-y-1.5">
                            <Label style={{ color: textColor }}>{inp.label}</Label>
                            <div className="relative">
                                {inp.icon && Icons[inp.icon] && (
                                    <div className="absolute left-3 top-2.5 text-gray-400">
                                        {React.createElement(Icons[inp.icon], { size: 16 })}
                                    </div>
                                )}
                                <Input
                                    placeholder={inp.placeholder}
                                    className={inp.icon ? 'pl-9' : ''}
                                    style={{ borderColor: theme?.border }}
                                />
                            </div>
                        </div>
                    ))}
                    <Button
                        className="w-full mt-4"
                        style={{ backgroundColor: primaryColor, color: '#fff' }}
                    >
                        {props?.submitLabel || 'Submit'}
                    </Button>
                </div>
            );

        case 'Card':
            return (
                <Card className="m-2 shadow-sm border" style={{ backgroundColor: surfaceColor, borderColor: theme?.border }}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center justify-between" style={{ color: textColor }}>
                            {props?.title || 'Card Title'}
                            {Icon && <Icon className="w-4 h-4" style={{ color: theme?.muted || '#9ca3af' }} />}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" style={{ color: primaryColor }}>{props?.value || '$0.00'}</div>
                        <div className="text-xs" style={{ color: theme?.muted || '#6b7280' }}>{props?.subtitle || 'Description'}</div>
                    </CardContent>
                </Card>
            );

        case 'List':
            return (
                <div className="m-2 rounded-lg border" style={{ backgroundColor: surfaceColor, borderColor: theme?.border }}>
                    <div className="p-3 border-b font-medium" style={{ backgroundColor: `${primaryColor}10`, color: textColor }}>
                        {props?.title || 'List'}
                    </div>
                    <div className="divide-y" style={{ borderColor: theme?.border }}>
                        {(props?.items || [1, 2, 3]).map((i: any, idx: number) => (
                            <div key={idx} className="p-3 flex items-center justify-between hover:opacity-80 cursor-pointer text-sm" style={{ color: textColor }}>
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                                    >
                                        {Icon ? <Icon className="w-4 h-4" /> : <Icons.User className="w-4 h-4" />}
                                    </div>
                                    <span>{typeof i === 'string' ? i : `Item ${i}`}</span>
                                </div>
                                <Icons.ChevronRight className="w-4 h-4" style={{ color: theme?.muted }} />
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'Chart':
            return (
                <div className="m-2 p-4 border rounded-lg flex flex-col items-center justify-center min-h-[150px] relative overflow-hidden"
                    style={{ backgroundColor: surfaceColor, borderColor: theme?.border }}>
                    <div className="absolute inset-x-4 bottom-0 flex items-end justify-between h-[100px] opacity-20">
                        {[40, 70, 50, 80, 30, 90].map((h, i) => (
                            <div key={i} className="w-4 rounded-t" style={{ height: `${h}%`, backgroundColor: primaryColor }}></div>
                        ))}
                    </div>
                    <p className="text-sm font-semibold relative z-10 mb-2" style={{ color: textColor }}>{props?.title || 'Analytics'}</p>
                    <div className="flex items-center gap-2 relative z-10">
                        <Icons.BarChart className="w-6 h-6" style={{ color: primaryColor }} />
                        <span className="text-2xl font-bold" style={{ color: primaryColor }}>+24%</span>
                    </div>
                </div>
            );

        case 'Button':
            const isOutline = props?.variant === 'outline';
            const isDestructive = props?.variant === 'destructive';

            let btnStyle: any = {};
            if (isDestructive) {
                btnStyle = { backgroundColor: theme?.error || '#ef4444', color: '#fff' };
            } else if (isOutline) {
                btnStyle = { borderColor: primaryColor, color: primaryColor, backgroundColor: 'transparent', borderWidth: '1px', borderStyle: 'solid' };
            } else if (props?.variant === 'ghost') {
                btnStyle = { color: textColor, backgroundColor: 'transparent' };
            } else {
                btnStyle = { backgroundColor: primaryColor, color: '#fff' };
            }

            return (
                <div className={`p-2 ${style?.flex === '1' ? 'flex-1' : ''}`} style={style}>
                    <Button className="w-full cursor-pointer" style={btnStyle} variant={isOutline ? 'outline' : 'default'}>
                        {Icon && <Icon className="mr-2 w-4 h-4" />}
                        {props?.label || 'Click Me'}
                    </Button>
                </div>
            )

        case 'Input':
            return (
                <div className="p-2 space-y-1">
                    {props?.label && <Label style={{ color: textColor }}>{props.label}</Label>}
                    <div className="relative">
                        {Icon && <div className="absolute left-3 top-2.5 text-gray-400"><Icon size={16} /></div>}
                        <Input
                            placeholder={props?.placeholder || ''}
                            className={Icon ? 'pl-9' : ''}
                        />
                    </div>
                </div>
            )

        case 'Icon':
            return (
                <div className="p-2 flex justify-center" style={style}>
                    {Icon ? <Icon className="w-6 h-6" style={{ color: props?.color || primaryColor }} /> : <Icons.Heart />}
                </div>
            )

        case 'Text':
            return (
                <div className={`p-2 ${props?.className}`} style={{ color: textColor, ...style }}>
                    {props?.content || 'Text content'}
                </div>
            );

        case 'ImagePlaceholder':
            return (
                <div className="m-2 aspect-video rounded-lg flex items-center justify-center relative overflow-hidden"
                    style={{ backgroundColor: theme?.muted || '#f3f4f6' }}>

                    {props?.src ? (
                        <img
                            src={props.src}
                            className="absolute inset-0 w-full h-full object-cover"
                            alt="Content"
                        />
                    ) : (
                        <Icons.Image className="w-8 h-8 opacity-20" style={{ color: textColor }} />
                    )}
                </div>
            )

        case 'Sidebar':
            return (
                <div className="h-full w-64 flex flex-col hidden md:flex border-r" style={{ backgroundColor: surfaceColor, borderColor: theme?.border }}>
                    <div className="p-4 font-bold border-b flex items-center gap-2" style={{ borderColor: theme?.border, color: primaryColor }}>
                        <div className="p-1 rounded bg-current text-white"><Icons.LayoutGrid size={16} /></div>
                        {props?.title || 'Dashboard'}
                    </div>
                    <div className="flex-1 p-3 space-y-1">
                        {['Dashboard', 'Analytics', 'Settings'].map((item, i) => (
                            <div key={item}
                                className={`p-2 rounded cursor-pointer flex items-center gap-3 text-sm font-medium ${i === 0 ? 'bg-opacity-10' : 'hover:bg-gray-100'}`}
                                style={{
                                    backgroundColor: i === 0 ? `${primaryColor}15` : 'transparent',
                                    color: i === 0 ? primaryColor : textColor
                                }}>
                                {i === 0 ? <Icons.Home size={16} /> : i === 1 ? <Icons.BarChart size={16} /> : <Icons.Settings size={16} />}
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            )

        default:
            return null;
    }
};
