
import React, { useState, useCallback, useRef } from 'react';
import { Confession, Tone, PostType } from '../types';
import { TONES } from '../constants';
import { changeTone } from '../services/geminiService';

interface SubmissionFormProps {
  addConfession: (confession: Omit<Confession, 'id' | 'createdAt' | 'comments' | 'upvotes' | 'status' | 'hasBeenRead'>) => void;
  isLoading: boolean;
}

const SubmissionForm: React.FC<SubmissionFormProps> = ({ addConfession, isLoading }) => {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [isEmojiOnly, setIsEmojiOnly] = useState(false);
  const [isReadOnce, setIsReadOnce] = useState(false);
  const [commentsLocked, setCommentsLocked] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [blurredImageUrl, setBlurredImageUrl] = useState<string | null>(null);
  const [isProcessingTone, setIsProcessingTone] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [activeTone, setActiveTone] = useState<Tone | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let value = e.target.value;
    if (isEmojiOnly) {
      const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])| /g;
      value = (value.match(emojiRegex) || []).join('');
    }
    setContent(value);
    setOriginalContent(value);
    setActiveTone(null);
  };

  const handleToneChange = async (tone: Tone) => {
    if (!content || isProcessingTone) return;
    setIsProcessingTone(true);
    setActiveTone(tone);
    if (!originalContent) setOriginalContent(content); // Save original if not already saved
    const newContent = await changeTone(originalContent, tone);
    setContent(newContent);
    setIsProcessingTone(false);
  };

  const handleRevert = () => {
    setContent(originalContent);
    setActiveTone(null);
  };
  
  const blurImage = (file: File) => {
    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if(ctx) {
                // Simulate backend face detection and blurring
                ctx.filter = 'blur(20px)';
                ctx.drawImage(img, 0, 0);
                setBlurredImageUrl(canvas.toDataURL('image/jpeg'));
            }
            setIsProcessingImage(false);
        };
        img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      blurImage(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addConfession({
      content,
      tone: activeTone,
      postType: isEmojiOnly ? PostType.Emoji : PostType.Text,
      imageUrl: blurredImageUrl || undefined,
      isReadOnce,
      commentsLocked,
    });
    // Reset form
    setContent('');
    setOriginalContent('');
    setIsEmojiOnly(false);
    setIsReadOnce(false);
    setCommentsLocked(false);
    setImageFile(null);
    setBlurredImageUrl(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700">
      <h2 className="text-2xl font-bold text-rose-400 mb-4">Share Your Secret</h2>
      
      <div>
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder={isEmojiOnly ? "Enter emoji only..." : "What's on your mind?"}
          className="w-full h-40 p-3 bg-slate-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
          disabled={isProcessingTone || isLoading}
        />
        <div className="text-right text-xs text-slate-400 mt-1">{content.length} / 1000</div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">AI Tone Changer</label>
        <div className="flex flex-wrap gap-2">
          {TONES.map(tone => (
            <button
              key={tone}
              type="button"
              onClick={() => handleToneChange(tone)}
              disabled={isProcessingTone || !content}
              className={`px-3 py-1 text-sm rounded-full transition-all ${
                activeTone === tone ? 'bg-rose-600 text-white font-semibold ring-2 ring-offset-2 ring-offset-slate-800 ring-rose-500' : 'bg-slate-700 hover:bg-slate-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {tone}
            </button>
          ))}
          {activeTone && (
            <button
              type="button"
              onClick={handleRevert}
              disabled={isProcessingTone}
              className="px-3 py-1 text-sm rounded-full bg-rose-800 hover:bg-rose-700 text-white"
            >
              Revert
            </button>
          )}
        </div>
         {isProcessingTone && <div className="text-sm text-rose-400 mt-2 animate-pulse">Changing tone...</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Image (Privacy First)</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-100 file:text-rose-700 hover:file:bg-rose-200"/>
          {isProcessingImage && <div className="text-sm text-rose-400 mt-2 animate-pulse">Blurring faces...</div>}
          {blurredImageUrl && <img src={blurredImageUrl} alt="Blurred preview" className="mt-2 rounded-md max-h-32"/>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Options</label>
          <div className="space-y-2">
             <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={isEmojiOnly} onChange={(e) => { setIsEmojiOnly(e.target.checked); if(e.target.checked) setContent(''); }} className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-rose-600 focus:ring-rose-500"/> Emoji-Only Mode</label>
             <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={isReadOnce} onChange={(e) => setIsReadOnce(e.target.checked)} className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-rose-600 focus:ring-rose-500"/> Read-Once</label>
             <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={commentsLocked} onChange={(e) => setCommentsLocked(e.target.checked)} className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-rose-600 focus:ring-rose-500"/> Lock Comments</label>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!content.trim() || isLoading || isProcessingTone || isProcessingImage}
        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : 'Submit Anonymously'}
      </button>

    </form>
  );
};

export default SubmissionForm;