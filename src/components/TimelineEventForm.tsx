import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Calendar, Tag, Type, AlignLeft, Trash2 } from 'lucide-react';
import { TimelineEvent } from '../services/gemini';

interface TimelineEventFormProps {
  events: TimelineEvent[];
  onAddEvent: (event: TimelineEvent) => void;
  onRemoveEvent: (id: string) => void;
}

export const TimelineEventForm: React.FC<TimelineEventFormProps> = ({ events, onAddEvent, onRemoveEvent }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newEvent, setNewEvent] = useState({
    date: '',
    title: '',
    description: '',
    emotionalTags: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;

    const event: TimelineEvent = {
      id: Math.random().toString(36).substr(2, 9),
      date: newEvent.date,
      title: newEvent.title,
      description: newEvent.description,
      emotionalTags: newEvent.emotionalTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    };

    onAddEvent(event);
    setNewEvent({ date: '', title: '', description: '', emotionalTags: '' });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40">Timeline Events</h3>
        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium transition-all text-[#ff4e00]"
        >
          {isAdding ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          {isAdding ? 'Cancel' : 'Add Event'}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/30 ml-1">
                    <Calendar className="w-3 h-3" /> Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Summer 2015"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff4e00]/50 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/30 ml-1">
                    <Type className="w-3 h-3" /> Event Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Graduation"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff4e00]/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/30 ml-1">
                  <AlignLeft className="w-3 h-3" /> Description
                </label>
                <textarea
                  placeholder="Briefly describe what happened..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff4e00]/50 transition-all h-20 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/30 ml-1">
                  <Tag className="w-3 h-3" /> Emotional Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Joy, Anxiety, Hope"
                  value={newEvent.emotionalTags}
                  onChange={(e) => setNewEvent({ ...newEvent, emotionalTags: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff4e00]/50 transition-all"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="w-full py-3 rounded-xl bg-[#ff4e00] hover:bg-[#ff6a26] text-white text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-[#ff4e00]/20"
              >
                Save Event
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {events.map((event) => (
          <motion.div
            key={event.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative p-5 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-all"
          >
            <button
              type="button"
              onClick={() => onRemoveEvent(event.id)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-white/0 hover:bg-red-500/10 text-white/0 group-hover:text-red-400 group-hover:bg-white/5 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            <div className="flex items-start gap-4">
              <div className="mt-1 p-2 rounded-lg bg-[#ff4e00]/10 text-[#ff4e00]">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="space-y-1 pr-8">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#ff4e00] uppercase tracking-widest">{event.date}</span>
                  <span className="w-1 h-1 rounded-full bg-white/10" />
                  <h4 className="text-sm font-medium text-white">{event.title}</h4>
                </div>
                {event.description && (
                  <p className="text-xs text-white/40 leading-relaxed">{event.description}</p>
                )}
                {event.emotionalTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {event.emotionalTags.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] text-white/30 uppercase tracking-tighter">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {events.length === 0 && !isAdding && (
          <div className="py-12 text-center border border-dashed border-white/10 rounded-3xl">
            <p className="text-xs text-white/20 uppercase tracking-widest">No events added yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
