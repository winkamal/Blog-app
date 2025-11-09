import React, { useState, useRef } from 'react';
import { PlayIcon, PauseIcon } from './Icons';

interface AudioPlayerProps {
    src: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const progressBarRef = useRef<HTMLInputElement>(null);
    const animationRef = useRef<number>();

    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const onLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const whilePlaying = () => {
        if (audioRef.current && progressBarRef.current) {
            progressBarRef.current.value = String(audioRef.current.currentTime);
            setCurrentTime(audioRef.current.currentTime);
            animationRef.current = requestAnimationFrame(whilePlaying);
        }
    };

    const togglePlayPause = () => {
        const prevValue = isPlaying;
        setIsPlaying(!prevValue);
        if (!prevValue) {
            audioRef.current?.play();
            animationRef.current = requestAnimationFrame(whilePlaying);
        } else {
            audioRef.current?.pause();
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        }
    };
    
    const changeRange = () => {
        if (audioRef.current && progressBarRef.current) {
            audioRef.current.currentTime = Number(progressBarRef.current.value);
            setCurrentTime(Number(progressBarRef.current.value));
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time) || time === 0) return '00:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="my-6 p-4 rounded-2xl bg-black/10 dark:bg-white/10 backdrop-blur-sm border border-black/10 dark:border-white/10 shadow-lg">
            <audio ref={audioRef} src={src} loop preload="metadata" onLoadedMetadata={onLoadedMetadata} />
            <div className="flex items-center gap-4">
                <button onClick={togglePlayPause} className="p-2 rounded-full text-gray-800 dark:text-gray-200 hover:bg-black/10 dark:hover:bg-white/10 transition-colors" aria-label={isPlaying ? 'Pause' : 'Play'}>
                    {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                </button>
                <span className="text-sm text-gradient opacity-80 font-mono w-12 text-center">{formatTime(currentTime)}</span>
                <input
                    type="range"
                    ref={progressBarRef}
                    defaultValue="0"
                    step="1"
                    min="0"
                    max={duration}
                    onChange={changeRange}
                    className="w-full h-1.5 bg-black/20 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
                <span className="text-sm text-gradient opacity-80 font-mono w-12 text-center">{formatTime(duration)}</span>
            </div>
        </div>
    );
};

export default AudioPlayer;
