import React, { useState } from "react";
import YouTube from "react-youtube";

interface YoutubeError {
    target: any;
    data: number;
}

const getErrorMessage = (errorCode: number): string => {
    switch (errorCode) {
        case 2:
            return '잘못된 매개변수입니다.(삭제되었거나 비공개 되었습니다.)';
        case 5:
            return 'HTML5 Player 오류가 발생하였습니다.';
        case 100:
            return '해당 동영상을 찾을 수 없습니다. (삭제되었거나 비공개 되었습니다.)';
        case 101:
            return '이 동영상은 재생할 수 없습니다.';
        case 150:
            return '이 동영상은 임베디드할 수 없습니다.';
        default:
            return '알 수 없는 오류가 발생하였습니다.';
    }
};


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
    const onError = (error: YoutubeError) => {
        const errorMessage = getErrorMessage(error.data);
        console.error('YouTube Player 에러:', errorMessage);
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