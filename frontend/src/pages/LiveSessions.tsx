// import { useAuth } from '@/context/AuthContext';
import { MeetingProvider } from "@videosdk.live/react-sdk";
import { useEffect, useState, useRef } from "react";
import { MeetingAppProvider } from "@/MeetingAppContextDef";
import { MeetingContainer } from "@/meeting/MeetingContainer.jsx";
import { LeaveScreen } from "@/components/screens/LeaveScreen.jsx";
import { JoiningScreen } from "@/components/screens/JoiningScreen.jsx";
import MobileUserNavbar from '@/components/sections/MobileUserNavbar.jsx';
// import ProfileSideBar from '@/components/sections/ProfileSideBar';
// import { useNavigate } from 'react-router-dom';

function LiveSessions() {
  document.title = 'SocialHive - Live Sessions';
  // const { user } = useAuth();
  // const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [micOn, setMicOn] = useState(false);
  const [webcamOn, setWebcamOn] = useState(false);
  const [customAudioStream, setCustomAudioStream] = useState<MediaStream | undefined>(undefined);
  const [customVideoStream, setCustomVideoStream] = useState<MediaStream | undefined>(undefined);
  const [isMeetingStarted, setMeetingStarted] = useState(false);
  const [isMeetingLeft, setIsMeetingLeft] = useState(false);
  const contentDivRef = useRef<HTMLDivElement>(null);

  const isMobile = window.matchMedia("only screen and (max-width: 768px)").matches;

  useEffect(() => {
    if (isMobile) {
      window.onbeforeunload = () => {
        return "Are you sure you want to exit?";
      };
    }
  }, [isMobile]);

  // Wrap the entire page in a relatively positioned container so that
  // we can position the "Recordings" button absolutely at the top-right.
  return (
    <div className="relative">
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col">
          <div ref={contentDivRef}>
            {isMobile && <MobileUserNavbar scrollableDiv={ contentDivRef } />}
          </div>
          <MeetingAppProvider>
            {isMeetingStarted ? (
              <MeetingProvider
                config={{
                  meetingId,
                  micEnabled: micOn,
                  webcamEnabled: webcamOn,
                  name: participantName ? participantName : "TestUser",
                  multiStream: true,
                  customCameraVideoTrack: customVideoStream,
                  customMicrophoneAudioTrack: customAudioStream,
                  debugMode: false
                }}
                token={token}
                reinitialiseMeetingOnConfigChange={true}
                joinWithoutUserInteraction={true}
              >
                <MeetingContainer
                  onMeetingLeave={() => {
                    setToken("");
                    setMeetingId("");
                    setParticipantName("");
                    setWebcamOn(false);
                    setMicOn(false);
                    setMeetingStarted(false);
                  }}
                  setIsMeetingLeft={setIsMeetingLeft}
                />
              </MeetingProvider>
            ) : isMeetingLeft ? (
              <LeaveScreen setIsMeetingLeft={setIsMeetingLeft} />
            ) : (
              <JoiningScreen
                participantName={participantName}
                setParticipantName={setParticipantName}
                setMeetingId={setMeetingId}
                setToken={setToken}
                micOn={micOn}
                setMicOn={setMicOn}
                webcamOn={webcamOn}
                setWebcamOn={setWebcamOn}
                customAudioStream={customAudioStream}
                setCustomAudioStream={setCustomAudioStream}
                customVideoStream={customVideoStream}
                setCustomVideoStream={setCustomVideoStream}
                onClickStartMeeting={() => {
                  setMeetingStarted(true);
                }}
                startMeeting={isMeetingStarted}
                setIsMeetingLeft={setIsMeetingLeft}
              />
            )}
          </MeetingAppProvider>
        </div>
      </div>
    </div>
  );
}

export default LiveSessions;
