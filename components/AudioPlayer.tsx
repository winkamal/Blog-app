
import React, { useRef, useEffect } from 'react';

interface AudioPlayerProps {
    src: string;
    autoPlay: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, autoPlay }) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (audioRef.current) {
            if (autoPlay) {
                // Attempt to play, but catch errors for browsers that block it.
                audioRef.current.play().catch(error => {
                    console.log("Autoplay was prevented by the browser.");
                });
            } else {
                audioRef.current.pause();
            }
        }
    }, [src, autoPlay]);

    return (
        <div className="my-4">
            <audio ref={audioRef} controls autoPlay={autoPlay} className="w-full">
                <source src={src} type="audio/mpeg" />
                Your browser does not support the audio element.
            </audio>
        </div>
    );
};

export default AudioPlayer;
