"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MousePointer, Type, Square, LayoutTemplate, Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';

interface ComponentData {
  id: string;
  type: 'text' | 'box' | 'queue_position' | 'wait_time' | 'image' | 'button';
  x: number;
  y: number;
  props: Record<string, any>;
}

// 16:9 Canvas size reference (scaled down for fit)
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 450;

export default function UIBuilder() {
  const { projectId } = useParams();
  const router = useRouter();

  const [components, setComponents] = useState<ComponentData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null); // Type of item being dragged from sidebar
  const [config, setConfig] = useState({ bgColor: '#ffffff', textColor: '#000000', title: '', message: '' });
  const [isSaving, setIsSaving] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch existing config
    fetch(`http://localhost:3001/api/projects/${projectId}`)
      .then(res => res.json())
      .then(data => {
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
      });
  }, [projectId]);

  // --- Drag & Drop Logic ---

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('type', type);
    setDraggedItem(type);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type') as ComponentData['type'];
    if (!type) return; // Might be internal move if we implemented that separately

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Add new component
    const newComponent: ComponentData = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        x: x - 50, // Center approx
        y: y - 20,
        props: getDefaultProps(type)
    };

    setComponents([...components, newComponent]);
    setSelectedId(newComponent.id);
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Internal Canvas Dragging
  const handleCanvasDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('componentId', id);
    e.stopPropagation(); // Don't trigger canvas drop
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const id = e.dataTransfer.getData('componentId');
      if (!id) return; // Fallback to sidebar drop logic

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setComponents(prev => prev.map(c =>
          c.id === id ? { ...c, x: x - 20, y: y - 10 } : c // simple offset
      ));
      e.stopPropagation();
  };


  const getDefaultProps = (type: string) => {
      switch(type) {
          case 'text': return { content: 'Double click to edit', fontSize: 16, color: '#000000' };
          case 'box': return { width: 100, height: 100, backgroundColor: '#eeeeee' };
          case 'queue_position': return { fontSize: 48, fontWeight: 'bold', color: '#000000', label: 'Position' };
          case 'wait_time': return { fontSize: 18, color: '#666666', prefix: 'Est. Wait: ' };
          case 'button': return { content: 'Enter Website', backgroundColor: '#000000', color: '#ffffff' };
          case 'image': return { src: 'https://via.placeholder.com/150', width: 150, height: 150 };
          default: return {};
      }
  };

  const handleSave = async () => {
      setIsSaving(true);
      try {
          await fetch(`http://localhost:3001/api/projects/${projectId}/config`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  ...config,
                  layout: components
              })
          });
          alert('Saved successfully!');
      } catch (err) {
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

  const selectedComponent = components.find(c => c.id === selectedId);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* --- Left Sidebar: Components --- */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col z-10">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
            <button onClick={() => router.push('/dashboard')} className="p-1 hover:bg-gray-100 rounded">
                <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-gray-800">UI Builder</h1>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Basic</div>
            <DraggableItem type="text" label="Text Block" icon={<Type size={18} />} onDragStart={handleDragStart} />
            <DraggableItem type="box" label="Container Box" icon={<Square size={18} />} onDragStart={handleDragStart} />
            <DraggableItem type="image" label="Image" icon={<ImageIcon size={18} />} onDragStart={handleDragStart} />

            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6">Logic</div>
            <DraggableItem type="queue_position" label="Queue Position" icon={<LayoutTemplate size={18} />} onDragStart={handleDragStart} />
            <DraggableItem type="wait_time" label="Wait Time" icon={<LayoutTemplate size={18} />} onDragStart={handleDragStart} />
        </div>
      </div>

      {/* --- Center: Canvas --- */}
      <div className="flex-1 flex flex-col relative">
        {/* Toolbar */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
             <div className="text-sm text-gray-500">
                Drag items from left. Select item to edit.
             </div>
             <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
             >
                 <Save size={16} />
                 {isSaving ? 'Saving...' : 'Save Design'}
             </button>
        </div>

        {/* Canvas Area */}
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
                className="relative shadow-2xl transition-colors"
                // Handle dropping moved items on the canvas itself is tricky with plain HTML5 if not handled carefully.
                // We'll use a simple approach: The canvas handles "new drops".
                // Moved items need their own onDrop logic or a global drop handler.
                // Let's refine: We put onDrop on the container.
            >
                {components.map(comp => (
                    <div
                        key={comp.id}
                        draggable
                        onDragStart={(e) => handleCanvasDragStart(e, comp.id)}
                        onDragEnd={(e) => {
                             // Calculate new position relative to canvas
                             const rect = canvasRef.current?.getBoundingClientRect();
                             if (!rect) return;
                             const x = e.clientX - rect.left;
                             const y = e.clientY - rect.top;
                             // Update
                             setComponents(prev => prev.map(c =>
                                 c.id === comp.id ? { ...c, x: x, y: y } : c
                             ));
                        }}
                        onClick={(e) => { e.stopPropagation(); setSelectedId(comp.id); }}
                        style={{
                            position: 'absolute',
                            left: comp.x,
                            top: comp.y,
                            cursor: 'move',
                            border: selectedId === comp.id ? '2px solid #3b82f6' : '1px dashed transparent',
                            padding: '4px'
                        }}
                    >
                        <RenderComponent comp={comp} />
                    </div>
                ))}

                {components.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300 pointer-events-none">
                        Drop components here
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* --- Right Sidebar: Properties --- */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
         <div className="p-4 border-b border-gray-200">
             <h2 className="font-bold text-gray-800">Properties</h2>
         </div>

         <div className="p-4 space-y-6">
             {selectedId ? (
                 <>
                    <div className="space-y-4">
                        <div className="font-semibold text-sm text-gray-600 uppercase">Selected: {selectedComponent?.type}</div>

                        {selectedComponent?.props.content !== undefined && (
                             <div>
                                 <label className="block text-xs font-medium text-gray-500 mb-1">Content</label>
                                 <input
                                     type="text"
                                     className="w-full border rounded p-2 text-sm"
                                     value={selectedComponent.props.content}
                                     onChange={(e) => updateSelectedProp('content', e.target.value)}
                                 />
                             </div>
                        )}

                        {(selectedComponent?.type === 'text' || selectedComponent?.type === 'queue_position') && (
                            <>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Font Size</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded p-2 text-sm"
                                        value={selectedComponent.props.fontSize || 16}
                                        onChange={(e) => updateSelectedProp('fontSize', Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Color</label>
                                    <input
                                        type="color"
                                        className="w-full h-8 border rounded cursor-pointer"
                                        value={selectedComponent.props.color || '#000000'}
                                        onChange={(e) => updateSelectedProp('color', e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                         {selectedComponent?.type === 'box' && (
                            <>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Width</label>
                                    <input type="number" className="w-full border rounded p-2 text-sm" value={selectedComponent.props.width} onChange={(e) => updateSelectedProp('width', Number(e.target.value))} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Height</label>
                                    <input type="number" className="w-full border rounded p-2 text-sm" value={selectedComponent.props.height} onChange={(e) => updateSelectedProp('height', Number(e.target.value))} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Background Color</label>
                                    <input type="color" className="w-full h-8 border rounded" value={selectedComponent.props.backgroundColor} onChange={(e) => updateSelectedProp('backgroundColor', e.target.value)} />
                                </div>
                            </>
                        )}

                        <button
                            onClick={deleteSelected}
                            className="w-full mt-8 bg-red-50 text-red-600 border border-red-200 py-2 rounded text-sm hover:bg-red-100"
                        >
                            Delete Component
                        </button>
                    </div>
                 </>
             ) : (
                 <div className="space-y-4">
                     <div className="font-semibold text-sm text-gray-600 uppercase">Global Settings</div>
                     <div>
                         <label className="block text-xs font-medium text-gray-500 mb-1">Background Color</label>
                         <input
                            type="color"
                            className="w-full h-8 border rounded cursor-pointer"
                            value={config.bgColor}
                            onChange={(e) => setConfig({ ...config, bgColor: e.target.value })}
                         />
                     </div>
                     <div>
                         <label className="block text-xs font-medium text-gray-500 mb-1">Page Title</label>
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
    switch(comp.type) {
        case 'text':
            return <div style={{ fontSize: comp.props.fontSize, color: comp.props.color }}>{comp.props.content}</div>;
        case 'queue_position':
            return (
                <div className="text-center" style={{ color: comp.props.color }}>
                    <div style={{ fontSize: comp.props.fontSize * 0.4 }} className="opacity-70 uppercase tracking-wide text-xs mb-1">{comp.props.label || 'Position'}</div>
                    <div style={{ fontSize: comp.props.fontSize, fontWeight: 'bold' }}>14</div>
                </div>
            );
        case 'wait_time':
            return <div style={{ fontSize: comp.props.fontSize, color: comp.props.color }}>{comp.props.prefix} 10 mins</div>;
        case 'box':
            return <div style={{ width: comp.props.width, height: comp.props.height, backgroundColor: comp.props.backgroundColor }}></div>;
        case 'image':
            return <img src={comp.props.src} width={comp.props.width} height={comp.props.height} className="object-cover" alt="" />;
        case 'button':
            return <button style={{ backgroundColor: comp.props.backgroundColor, color: comp.props.color, padding: '8px 16px', borderRadius: '4px' }}>{comp.props.content}</button>;
        default:
            return <div>Unknown</div>;
    }
}
