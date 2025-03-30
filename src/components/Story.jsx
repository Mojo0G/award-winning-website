import React, { useState, useRef, useEffect } from 'react';
import './VideoPlayer.css'; // You would need to create this CSS file with the styles

const VideoPlayer = () => {
  // State variables
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Refs
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const controlsTimeout = useRef(null);
  
  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Update progress bar
  const updateProgress = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      
      setCurrentTime(currentTime);
      setProgress((currentTime / duration) * 100);
    }
  };
  
  // Handle video metadata loaded
  const handleMetadataLoaded = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };
  
  // Handle seeking
  const handleSeek = (e) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    
    if (videoRef.current) {
      videoRef.current.currentTime = pos * videoRef.current.duration;
      setProgress(pos * 100);
    }
  };
  
  // Format time display
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    const hDisplay = h > 0 ? `${h.toString().padStart(2, '0')}:` : '';
    const mDisplay = `${m.toString().padStart(2, '0')}:`;
    const sDisplay = s.toString().padStart(2, '0');
    
    return `${hDisplay}${mDisplay}${sDisplay}`;
  };
  
  // Handle volume change
  const handleVolumeChange = (e) => {
    const volume = parseFloat(e.target.value);
    setVolume(volume);
    
    if (videoRef.current) {
      videoRef.current.volume = volume;
      setIsMuted(volume === 0);
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  // Change playback speed
  const changePlaybackSpeed = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    
    if (videoRef.current) {
      videoRef.current.playbackRate = speeds[nextIndex];
      setPlaybackSpeed(speeds[nextIndex]);
    }
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (playerContainerRef.current.requestFullscreen) {
        playerContainerRef.current.requestFullscreen();
      } else if (playerContainerRef.current.webkitRequestFullscreen) {
        playerContainerRef.current.webkitRequestFullscreen();
      } else if (playerContainerRef.current.msRequestFullscreen) {
        playerContainerRef.current.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };
  
  // Show/hide controls based on mouse movement
  const handleMouseMove = () => {
    setShowControls(true);
    
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };
  
  // Clean up event listeners
  useEffect(() => {
    const video = videoRef.current;
    
    const fullscreenChangeHandler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', fullscreenChangeHandler);
    
    return () => {
      document.removeEventListener('fullscreenchange', fullscreenChangeHandler);
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, []);
  
  return (
    <div className="video-player-app">
      <div className="header">
        <div className="header-left">
          <div className="logo">VideoPlay</div>
        </div>
        <div className="header-right">
          <button className="menu-btn">☰</button>
        </div>
      </div>
      
      <div 
        className="player-container" 
        ref={playerContainerRef}
        onMouseMove={handleMouseMove}
      >
        <div className="video-container">
          <video
            ref={videoRef}
            className="video-element"
            src="videos/feature-6.mp4" 
            poster="/api/placeholder/1280/720"
            onTimeUpdate={updateProgress}
            onLoadedMetadata={handleMetadataLoaded}
            onClick={togglePlay}
          />
          
          <div 
            className="center-play"
            style={{ opacity: isPlaying ? 0 : 1 }}
            onClick={togglePlay}
          >
            ▶
          </div>
          
          <div 
            className="controls-container" 
            style={{ opacity: showControls ? 1 : 0 }}
          >
            <div className="progress-container" onClick={handleSeek}>
              <div 
                className="progress-bar" 
                style={{ width: `${progress}%` }}
              >
                <div className="progress-thumb"></div>
              </div>
            </div>
            
            <div className="primary-controls">
              <button className="control-btn" onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime -= 10;
                }
              }}>
                ⏪
              </button>
              
              <button className="control-btn play-btn" onClick={togglePlay}>
                {isPlaying ? '⏸' : '▶'}
              </button>
              
              <button className="control-btn" onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime += 10;
                }
              }}>
                ⏩
              </button>
              
              <div className="time-display">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            
            <div className="secondary-controls">
              <div className="left-controls">
                <button className="control-btn" onClick={toggleMute}>
                  {isMuted ? '🔇' : '🔊'}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                />
                
                <div className="playback-speed" onClick={changePlaybackSpeed}>
                  {playbackSpeed}x
                </div>
              </div>
              
              <div className="right-controls">
                <button className="control-btn" onClick={() => alert('Subtitles would appear here')}>
                  CC
                </button>
                <button className="control-btn" onClick={() => alert('Quality settings would appear here')}>
                  ⚙️
                </button>
                <button className="control-btn" onClick={toggleFullscreen}>
                  {isFullscreen ? '↙' : '↗'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;