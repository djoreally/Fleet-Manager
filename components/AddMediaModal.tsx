import React, { useState, useRef, useEffect } from 'react';
import type { MediaAttachment, MediaType } from '../types';
import { CameraIcon } from './icons/CameraIcon';
import { VideoIcon } from './icons/VideoIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface AddMediaModalProps {
  onClose: () => void;
  onMediaCaptured: (media: Omit<MediaAttachment, 'id'>) => void;
}

const blobToBase64 = (blob: Blob): Promise<{ data: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            const [header, data] = dataUrl.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1] || blob.type;
            resolve({ data, mimeType });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const AudioRecorder: React.FC<{ onRecordingComplete: (blob: Blob) => void }> = ({ onRecordingComplete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerIntervalRef = useRef<number | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = event => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                onRecordingComplete(audioBlob);
                stream.getTracks().forEach(track => track.stop()); // Clean up the stream
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerIntervalRef.current = window.setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please check your browser permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        }
    };

    useEffect(() => {
        return () => { // Cleanup on unmount
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);
    
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4 p-4 bg-background/50 rounded-lg">
            <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors ${isRecording ? 'bg-danger' : 'bg-accent'}`}
            >
                <MicrophoneIcon className="w-8 h-8 text-text-inverted" />
            </button>
            <p className="text-lg font-mono text-text-primary">{formatTime(recordingTime)}</p>
            <p className="text-sm text-text-secondary">{isRecording ? 'Tap to Stop' : 'Tap to Record'}</p>
        </div>
    );
};


export const AddMediaModal: React.FC<AddMediaModalProps> = ({ onClose, onMediaCaptured }) => {
  const [activeTab, setActiveTab] = useState<'select' | 'audio'>('select');
  const [isLoading, setIsLoading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsLoading(true);
      try {
        const { data, mimeType } = await blobToBase64(file);
        onMediaCaptured({ type, data, mimeType });
      } catch (error) {
        console.error("Error processing file:", error);
        alert("Could not process the file.");
      } finally {
        setIsLoading(false);
      }
  };
  
  const handleRecordingComplete = async (blob: Blob) => {
    setIsLoading(true);
    try {
        const { data, mimeType } = await blobToBase64(blob);
        onMediaCaptured({ type: 'audio', data, mimeType });
    } catch (error) {
        console.error("Error processing audio:", error);
        alert("Could not process the audio recording.");
    } finally {
        setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
        <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex flex-col justify-center items-center p-4 gap-4" onClick={onClose}>
            <SpinnerIcon className="w-10 h-10 text-text-primary animate-spin-slow" />
            <p className="text-text-secondary">Processing media...</p>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
        <div className="w-full max-w-sm bg-surface-glass backdrop-blur-md rounded-lg shadow-xl border border-line animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4 text-center">Add Media</h3>
                <div className="flex flex-col gap-4">
                     <button onClick={() => imageInputRef.current?.click()} className="w-full flex items-center gap-3 p-4 rounded-lg bg-surface hover:bg-line/50 border border-line transition-colors">
                        <CameraIcon className="w-6 h-6 text-accent" />
                        <span className="font-semibold text-text-secondary">Take Photo</span>
                    </button>
                    <input type="file" accept="image/*" capture="environment" ref={imageInputRef} onChange={(e) => handleFileChange(e, 'image')} className="hidden" />
                    
                    <button onClick={() => videoInputRef.current?.click()} className="w-full flex items-center gap-3 p-4 rounded-lg bg-surface hover:bg-line/50 border border-line transition-colors">
                        <VideoIcon className="w-6 h-6 text-accent" />
                        <span className="font-semibold text-text-secondary">Record Video</span>
                    </button>
                    <input type="file" accept="video/*" capture="environment" ref={videoInputRef} onChange={(e) => handleFileChange(e, 'video')} className="hidden" />

                    <div className="w-full">
                        <AudioRecorder onRecordingComplete={handleRecordingComplete} />
                    </div>
                </div>
            </div>
             <div className="p-4 border-t border-line flex justify-end bg-surface-glass rounded-b-lg">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-line rounded-md shadow-sm text-sm font-medium text-text-secondary bg-surface hover:bg-line/50">
                    Cancel
                </button>
            </div>
        </div>
        <style>{`
            @keyframes fade-in-up {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
        `}</style>
    </div>
  );
};