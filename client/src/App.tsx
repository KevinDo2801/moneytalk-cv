import { useRef, useState } from "react";
// import "./App.scss";
import { LiveAPIProvider, useLiveAPIContext } from "./contexts/LiveAPIContext";
import cn from "classnames";
import { LiveClientOptions } from "./types";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Authentication from './components/Authentication';
import FinancialDashboard from './components/FinancialDashboard';
import './App.css';
import { Altair } from "./components/altair/Altair";
import ControlTray from "./components/control-tray/ControlTray";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY as string;
if (typeof API_KEY !== "string") {
  throw new Error("set REACT_APP_GEMINI_API_KEY in .env");
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#000000'
      }}>
        <div style={{ color: '#00FF99' }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Authentication />;
  }

  return <FinancialDashboardWithConnection />;
}

function FinancialDashboardWithConnection() {
  const { connected, connect, disconnect } = useLiveAPIContext();
  
  const handleMicrophoneClick = () => {
    if (connected) {
      disconnect();
    } else {
      connect();
    }
  };

  return <FinancialDashboard onMicrophoneClick={handleMicrophoneClick} isConnected={connected} />;
}

const apiOptions: LiveClientOptions = {
  apiKey: API_KEY,
};

function App() {
  // this video reference is used for displaying the active stream, whether that is the webcam or screen capture
  // feel free to style as you see fit
  const videoRef = useRef<HTMLVideoElement>(null);
  // either the screen capture, the video or null, if null we hide it
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  return (
    <AuthProvider>
    <LiveAPIProvider options={apiOptions}>
      <AppContent />
        <div className="streaming-console" style={{ display: 'none' }}>
          <main>
            <div className="main-app-area">
              {/* APP goes here */}
              <Altair />
              <video
                className={cn("stream", {
                  hidden: !videoRef.current || !videoStream,
                })}
                ref={videoRef}
                autoPlay
                playsInline
              />
            </div>

            <ControlTray
              videoRef={videoRef}
              supportsVideo={true}
              onVideoStreamChange={setVideoStream}
            >
              {/* put your own buttons here */}
            </ControlTray>
          </main>
        </div>
    </LiveAPIProvider>
    </AuthProvider>
  );
}

export default App;
