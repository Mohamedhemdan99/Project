import { ILocalVideoTrack, IRemoteVideoTrack } from "agora-rtc-sdk-ng";
import { useEffect, useRef } from "react";

interface ParticipantVideoProps {
    participant: {
    id: string;
    name: string;
    isSelf: boolean;
    isVideoOn: boolean;
    videoTrack?: ILocalVideoTrack | IRemoteVideoTrack;
    };
    }
    
    export const ParticipantVideo: React.FC<ParticipantVideoProps> = ({ participant }) => {
    const videoRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
    if (participant.isVideoOn && participant.videoTrack && videoRef.current) {
    participant.videoTrack.play(videoRef.current);
    }
    return () => {
    if (participant.videoTrack) {
    participant.videoTrack.stop();
    }
    };
    }, [participant.isVideoOn, participant.videoTrack]);
    
    return (
    
    <div className="relative h-full w-full"> 
    {participant.isVideoOn ? (
         <div ref={videoRef} className="h-full w-full" /> 
        ) : ( <div className="h-full w-full flex items-center justify-center bg-video-dark"> 
        <div className="h-24 w-24 rounded-full bg-video-secondary flex items-center justify-center text-white text-4xl font-semibold"> 
            {participant.name.charAt(0)} </div> </div> )} {/* Participant name label */}
             <div className="absolute bottom-2 left-2 right-2 flex items-center">
                 <div className="text-white text-sm bg-black/60 px-2 py-1 rounded-full"> {participant.name} {participant.isSelf && "(You)"}
                  </div> 
                  </div> 
                  </div> ); 
                  };