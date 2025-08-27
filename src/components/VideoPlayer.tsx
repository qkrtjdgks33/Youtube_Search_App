import React, { useState } from "react";
import YouTube from "react-youtube";

interface VideoPlayerProps {
    videoId: string;
    onClose?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, onClose }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    // YouTube Player 설정 옵션
    const opts = {
        height: '390',
        width: '640',
        playerVars: {
            autoplay: 0,
            rel: 0,
            modestbranding: 1,
        },
    };

    const onStateChange = (event: any) => {
        if (event.data === 1) {
            setIsPlaying(true);
        } else {
            setIsPlaying(false);
        }
    };

    // 에러 발생 시 처리
    const onError = (error: any) => {
        console.error('YouTube Player 에러:', error);
    };

    return (
        <div className="video-player-container">
            <div className="video-player-header">
                <h3>영상 재생</h3>
                {onClose &&(
                    <button onClick={onClose} className="close-button">
                        X
                    </button>
                )}
            </div>

            <YouTube
                videoId={videoId}
                opts={opts}
                onStateChange={onStateChange}
                onError={onError}
                className="youtube-player"
            />

            <div className="video-player-info">
                <p>재생 상태: {isPlaying ? '재생중' : '일시정지'}</p>
            </div>
        </div>
    );
};

export default VideoPlayer;