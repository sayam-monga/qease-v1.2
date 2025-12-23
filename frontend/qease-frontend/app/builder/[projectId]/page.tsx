"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MousePointer, Type, Square, LayoutTemplate, Save, ArrowLeft, Image as ImageIcon, Minus, Maximize, Eye } from 'lucide-react';
import api from '@/src/utils/api';

interface ComponentData {
  id: string;
  type: 'text' | 'box' | 'queue_position' | 'wait_time' | 'image' | 'button' | 'divider' | 'spacer' | 'card';
  x: number;
  y: number;
  props: Record<string, any>;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 450;

export default function UIBuilder() {
  const { projectId } = useParams();
  const router = useRouter();

  const [components, setComponents] = useState<ComponentData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [config, setConfig] = useState({ bgColor: '#ffffff', textColor: '#000000', title: '', message: '' });
  const [isSaving, setIsSaving] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (projectId) {
        api.get(`/api/projects/${projectId}`)
           .then(({ data }) => {
                if (data.config) {
                    setConfig({
                        bgColor: data.config.bgColor,
                        textColor: data.config.textColor,
                        title: data.config.title,
                        message: data.config.message
                    });
                    if (data.config.layout && Array.isArray(data.config.layout)) {
                        setComponents(data.config.layout);
                    }
                }
           })
           .catch(console.error);
    }
  }, [projectId]);

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('type', type);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type') as ComponentData['type'];
    if (!type) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newComponent: ComponentData = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        x: x - 50,
        y: y - 20,
        props: getDefaultProps(type)
    };

    setComponents([...components, newComponent]);
    setSelectedId(newComponent.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCanvasDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('componentId', id);
    e.stopPropagation();
  };

  const getDefaultProps = (type: string) => {
      switch(type) {
          case 'text': return { content: 'Text Block', fontSize: 16, color: '#000000', fontWeight: 'normal', textAlign: 'left' };
          case 'box': return { width: 100, height: 100, backgroundColor: '#eeeeee', borderRadius: 0, boxShadow: 'none' };
          case 'card': return { width: 200, height: 150, backgroundColor: '#ffffff', borderRadius: 8, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: 16 };
          case 'queue_position': return { fontSize: 48, fontWeight: 'bold', color: '#000000', label: 'Position', textAlign: 'center' };
          case 'wait_time': return { fontSize: 18, color: '#666666', prefix: 'Est. Wait: ', fontWeight: 'normal', textAlign: 'center' };
          case 'button': return { content: 'Enter Website', backgroundColor: '#000000', color: '#ffffff', padding: 12, borderRadius: 4, fontSize: 16 };
          case 'image': return { src: 'https://via.placeholder.com/150', width: 150, height: 150, borderRadius: 0 };
          case 'divider': return { width: 200, height: 2, backgroundColor: '#cccccc' };
          case 'spacer': return { width: 50, height: 50 };
          default: return {};
      }
  };

  const handleSave = async () => {
      setIsSaving(true);
      try {
          await api.put(`/api/projects/${projectId}/config`, {
              ...config,
              layout: components
          });
          alert('Saved successfully!');
      } catch (err) {
          console.error(err);
          alert('Failed to save');
      } finally {
          setIsSaving(false);
      }
  };

  const updateSelectedProp = (key: string, value: any) => {
      if (!selectedId) return;
      setComponents(prev => prev.map(c =>
          c.id === selectedId ? { ...c, props: { ...c.props, [key]: value } } : c
      ));
  };

  const deleteSelected = () => {
      if (!selectedId) return;
      setComponents(prev => prev.filter(c => c.id !== selectedId));
      setSelectedId(null);
  };

  const handlePreview = () => {
      window.open(`/preview/${projectId}`, '_blank');
  };

  const selectedComponent = components.find(c => c.id === selectedId);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col z-10">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
            <button onClick={() => router.push(`/manage/${projectId}`)} className="p-1 hover:bg-gray-100 rounded">
                <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-gray-800">UI Builder</h1>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Basic</div>
            <DraggableItem type="text" label="Text" icon={<Type size={18} />} onDragStart={handleDragStart} />
            <DraggableItem type="box" label="Box" icon={<Square size={18} />} onDragStart={handleDragStart} />
            <DraggableItem type="card" label="Card" icon={<Square size={18} />} onDragStart={handleDragStart} />
            <DraggableItem type="image" label="Image" icon={<ImageIcon size={18} />} onDragStart={handleDragStart} />
            <DraggableItem type="divider" label="Divider" icon={<Minus size={18} />} onDragStart={handleDragStart} />
            <DraggableItem type="spacer" label="Spacer" icon={<Maximize size={18} />} onDragStart={handleDragStart} />

            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6">Logic</div>
            <DraggableItem type="queue_position" label="Position" icon={<LayoutTemplate size={18} />} onDragStart={handleDragStart} />
            <DraggableItem type="wait_time" label="Wait Time" icon={<LayoutTemplate size={18} />} onDragStart={handleDragStart} />
        </div>
      </div>

      {/* Center Canvas */}
      <div className="flex-1 flex flex-col relative">
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
             <div className="text-sm text-gray-500">
                Drag items to canvas. Click to edit props.
             </div>
             <div className="flex gap-2">
                <button
                    onClick={handlePreview}
                    className="flex items-center gap-2 bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200 transition text-sm"
                >
                    <Eye size={16} /> Preview
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50 transition text-sm"
                >
                    <Save size={16} />
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
             </div>
        </div>

        <div className="flex-1 bg-gray-100 flex items-center justify-center p-8 overflow-auto">
            <div
                ref={canvasRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{
                    width: CANVAS_WIDTH,
                    height: CANVAS_HEIGHT,
                    backgroundColor: config.bgColor
                }}
                className="relative shadow-2xl transition-colors bg-white"
            >
                {components.map(comp => (
                    <div
                        key={comp.id}
                        draggable
                        onDragStart={(e) => handleCanvasDragStart(e, comp.id)}
                        onDragEnd={(e) => {
                             const rect = canvasRef.current?.getBoundingClientRect();
                             if (!rect) return;
                             const x = e.clientX - rect.left;
                             const y = e.clientY - rect.top;
                             setComponents(prev => prev.map(c =>
                                 c.id === comp.id ? { ...c, x, y } : c
                             ));
                        }}
                        onClick={(e) => { e.stopPropagation(); setSelectedId(comp.id); }}
                        style={{
                            position: 'absolute',
                            left: comp.x,
                            top: comp.y,
                            cursor: 'move',
                            border: selectedId === comp.id ? '2px solid #3b82f6' : '1px dashed transparent',
                            zIndex: selectedId === comp.id ? 10 : 1
                        }}
                    >
                        <RenderComponent comp={comp} />
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Right Sidebar: Properties */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
         <div className="p-4 border-b border-gray-200">
             <h2 className="font-bold text-gray-800">Properties</h2>
         </div>

         <div className="p-4 space-y-6">
             {selectedId && selectedComponent ? (
                 <div className="space-y-4">
                    <div className="font-semibold text-sm text-gray-600 uppercase mb-4">Selected: {selectedComponent.type}</div>

                    {/* Content Props */}
                    {['text', 'button'].includes(selectedComponent.type) && (
                         <div className="space-y-1">
                             <label className="text-xs font-medium text-gray-500">Content</label>
                             <input
                                 type="text"
                                 className="w-full border rounded p-2 text-sm"
                                 value={selectedComponent.props.content || ''}
                                 onChange={(e) => updateSelectedProp('content', e.target.value)}
                             />
                         </div>
                    )}
                    {selectedComponent.type === 'image' && (
                         <div className="space-y-1">
                             <label className="text-xs font-medium text-gray-500">Image URL</label>
                             <input
                                 type="text"
                                 className="w-full border rounded p-2 text-sm"
                                 value={selectedComponent.props.src || ''}
                                 onChange={(e) => updateSelectedProp('src', e.target.value)}
                             />
                         </div>
                    )}

                    {/* Dimensions */}
                    {(['box', 'card', 'image', 'divider', 'spacer'].includes(selectedComponent.type)) && (
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500">Width</label>
                                <input type="number" className="w-full border rounded p-2 text-sm" value={selectedComponent.props.width || 0} onChange={(e) => updateSelectedProp('width', Number(e.target.value))} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500">Height</label>
                                <input type="number" className="w-full border rounded p-2 text-sm" value={selectedComponent.props.height || 0} onChange={(e) => updateSelectedProp('height', Number(e.target.value))} />
                            </div>
                        </div>
                    )}

                    {/* Typography */}
                    {['text', 'queue_position', 'wait_time', 'button'].includes(selectedComponent.type) && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500">Font Size</label>
                                <input
                                    type="number"
                                    className="w-full border rounded p-2 text-sm"
                                    value={selectedComponent.props.fontSize || 16}
                                    onChange={(e) => updateSelectedProp('fontSize', Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500">Color</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        className="h-9 w-9 border rounded cursor-pointer"
                                        value={selectedComponent.props.color || '#000000'}
                                        onChange={(e) => updateSelectedProp('color', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        className="flex-1 border rounded p-2 text-sm"
                                        value={selectedComponent.props.color || '#000000'}
                                        onChange={(e) => updateSelectedProp('color', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500">Align</label>
                                <select
                                    className="w-full border rounded p-2 text-sm"
                                    value={selectedComponent.props.textAlign || 'left'}
                                    onChange={(e) => updateSelectedProp('textAlign', e.target.value)}
                                >
                                    <option value="left">Left</option>
                                    <option value="center">Center</option>
                                    <option value="right">Right</option>
                                </select>
                            </div>
                        </>
                    )}

                    {/* Styling */}
                    {['box', 'card', 'button'].includes(selectedComponent.type) && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500">Background</label>
                                <div className="flex gap-2">
                                    <input type="color" className="h-9 w-9 border rounded" value={selectedComponent.props.backgroundColor || '#ffffff'} onChange={(e) => updateSelectedProp('backgroundColor', e.target.value)} />
                                    <input type="text" className="flex-1 border rounded p-2 text-sm" value={selectedComponent.props.backgroundColor || '#ffffff'} onChange={(e) => updateSelectedProp('backgroundColor', e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500">Border Radius</label>
                                <input type="number" className="w-full border rounded p-2 text-sm" value={selectedComponent.props.borderRadius || 0} onChange={(e) => updateSelectedProp('borderRadius', Number(e.target.value))} />
                            </div>
                        </>
                    )}

                    {['card'].includes(selectedComponent.type) && (
                         <div className="space-y-1">
                             <label className="text-xs font-medium text-gray-500">Padding</label>
                             <input type="number" className="w-full border rounded p-2 text-sm" value={selectedComponent.props.padding || 0} onChange={(e) => updateSelectedProp('padding', Number(e.target.value))} />
                         </div>
                    )}

                    <button
                        onClick={deleteSelected}
                        className="w-full mt-8 bg-red-50 text-red-600 border border-red-200 py-2 rounded text-sm hover:bg-red-100"
                    >
                        Delete Component
                    </button>
                 </div>
             ) : (
                 <div className="space-y-4">
                     <div className="font-semibold text-sm text-gray-600 uppercase">Page Settings</div>
                     <div className="space-y-1">
                         <label className="text-xs font-medium text-gray-500">Background Color</label>
                         <div className="flex gap-2">
                            <input
                                type="color"
                                className="h-9 w-9 border rounded cursor-pointer"
                                value={config.bgColor}
                                onChange={(e) => setConfig({ ...config, bgColor: e.target.value })}
                            />
                            <input
                                type="text"
                                className="flex-1 border rounded p-2 text-sm"
                                value={config.bgColor}
                                onChange={(e) => setConfig({ ...config, bgColor: e.target.value })}
                            />
                         </div>
                     </div>
                     <div className="space-y-1">
                         <label className="text-xs font-medium text-gray-500">Page Title</label>
                         <input
                             type="text"
                             className="w-full border rounded p-2 text-sm"
                             value={config.title}
                             onChange={(e) => setConfig({ ...config, title: e.target.value })}
                         />
                     </div>
                 </div>
             )}
         </div>
      </div>
    </div>
  );
}

function DraggableItem({ type, label, icon, onDragStart }: any) {
    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, type)}
            className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded cursor-grab hover:bg-white hover:shadow-sm transition select-none"
        >
            <span className="text-gray-500">{icon}</span>
            <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
    );
}

function RenderComponent({ comp }: { comp: ComponentData }) {
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
                    <div>14</div>
                </div>
            );
        case 'wait_time':
            return <div style={style}>{comp.props.prefix} 10 mins</div>;
        case 'box':
        case 'card':
        case 'spacer':
            return <div style={style}></div>;
        case 'divider':
            return <div style={style}></div>;
        case 'image':
            return <img src={comp.props.src} style={{...style, objectFit: 'cover'}} alt="" draggable={false} />;
        case 'button':
            return <button style={style}>{comp.props.content}</button>;
        default:
            return <div style={{ border: '1px solid red', padding: 4 }}>Unknown</div>;
    }
}
