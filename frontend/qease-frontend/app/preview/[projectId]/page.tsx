"use client"
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface ComponentData {
  id: string;
  type: string;
  x: number;
  y: number;
  props: Record<string, any>;
}

export default function PreviewPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    if (projectId) {
        fetch(`http://localhost:3001/api/projects/${projectId}`)
           .then(res => res.json())
           .then(data => setProject(data))
           .catch(console.error);
    }
  }, [projectId]);

  if (!project) return <div className="p-8">Loading Preview...</div>;

  const renderContent = () => {
    if (project.config?.layout && Array.isArray(project.config.layout) && project.config.layout.length > 0) {
        return (
            <div
                className="min-h-screen relative overflow-hidden flex items-center justify-center"
                style={{ backgroundColor: project.config.bgColor }}
            >
                <div
                    className="relative bg-white shadow-2xl scale-90 origin-center border border-dashed border-gray-300"
                    style={{
                        width: 800,
                        height: 450,
                        backgroundColor: project.config.bgColor
                    }}
                >
                    <div className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded opacity-50 z-50">PREVIEW MODE</div>

                    {project.config.layout.map((comp: ComponentData) => (
                        <div
                            key={comp.id}
                            style={{
                                position: 'absolute',
                                left: comp.x,
                                top: comp.y,
                            }}
                        >
                            <RenderComponent comp={comp} position={42} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center text-center p-8"
            style={{ backgroundColor: project.config?.bgColor || '#ffffff', color: project.config?.textColor || '#000000' }}
        >
            <div className="absolute top-4 right-4 bg-black text-white text-xs px-2 py-1 rounded opacity-50">PREVIEW MODE</div>
            <div className="max-w-md w-full">
                <h1 className="text-3xl font-bold mb-6">{project.config?.title || "You are in line"}</h1>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-black/5 mb-8">
                <div className="text-6xl font-black mb-2">42</div>
                <div className="text-sm opacity-75 uppercase tracking-wider font-semibold">People ahead of you</div>
                </div>
                <p className="text-lg opacity-90 mb-8">{project.config?.message || "Thanks for your patience."}</p>
                <div className="mt-8 text-xs opacity-50">Powered by Qease</div>
            </div>
        </div>
    );
  };

  return renderContent();
}

function RenderComponent({ comp, position }: { comp: ComponentData, position: number }) {
    const style: React.CSSProperties = {
        width: comp.props.width,
        height: comp.props.height,
        backgroundColor: comp.props.backgroundColor,
        color: comp.props.color,
        fontSize: comp.props.fontSize,
        fontWeight: comp.props.fontWeight,
        textAlign: comp.props.textAlign as any,
        borderRadius: comp.props.borderRadius,
        boxShadow: comp.props.boxShadow,
        padding: comp.props.padding,
    };

    switch(comp.type) {
        case 'text':
            return <div style={style}>{comp.props.content}</div>;
        case 'queue_position':
            return (
                <div style={style}>
                    <div style={{ fontSize: (comp.props.fontSize || 48) * 0.4 }} className="opacity-70 uppercase tracking-wide mb-1">{comp.props.label}</div>
                    <div style={{ fontWeight: 'bold' }}>{position}</div>
                </div>
            );
        case 'wait_time':
            return <div style={style}>{comp.props.prefix} 15 mins</div>;
        case 'box':
        case 'card':
        case 'spacer':
            return <div style={style}></div>;
        case 'divider':
            return <div style={style}></div>;
        case 'image':
            return <img src={comp.props.src} style={{...style, objectFit: 'cover'}} alt="" />;
        case 'button':
            return <button style={style}>{comp.props.content}</button>;
        default:
            return null;
    }
}
