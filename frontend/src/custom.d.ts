declare module '@/MeetingAppContextDef' {
  import { ReactNode } from 'react';

  interface MeetingAppProviderProps {
    children: ReactNode;
  }

  const MeetingAppProvider: React.FC<MeetingAppProviderProps>;
  export { MeetingAppProvider };
}

declare module '@/components/screens/JoiningScreen.jsx' {
  const JoiningScreen: React.FC<{
    participantName: string;
    setParticipantName: React.Dispatch<React.SetStateAction<string>>;
    setMeetingId: React.Dispatch<React.SetStateAction<string>>;
    setToken: React.Dispatch<React.SetStateAction<string>>;
    onClickStartMeeting: () => void;
    micOn: boolean;
    webcamOn: boolean;
    setWebcamOn: React.Dispatch<React.SetStateAction<boolean>>;
    setMicOn: React.Dispatch<React.SetStateAction<boolean>>;
    customAudioStream: MediaStream | undefined;
    setCustomAudioStream: React.Dispatch<React.SetStateAction<MediaStream | undefined>>;
    customVideoStream: MediaStream | undefined;
    setCustomVideoStream: React.Dispatch<React.SetStateAction<MediaStream | undefined>>;
    startMeeting: boolean;
    setIsMeetingLeft: React.Dispatch<React.SetStateAction<boolean>>;
  }>;
  export { JoiningScreen };
}

declare module '@/components/screens/LeaveScreen.jsx' {
  const LeaveScreen: React.FC<{ setIsMeetingLeft: React.Dispatch<React.SetStateAction<boolean>> }>;
  export { LeaveScreen };
}

declare module '@/meeting/MeetingContainer.jsx' {
  const MeetingContainer: React.FC<{
    onMeetingLeave: () => void;
    setIsMeetingLeft: React.Dispatch<React.SetStateAction<boolean>>;
  }>;
  export { MeetingContainer };
}