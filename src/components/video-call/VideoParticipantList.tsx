
import React from "react";
import { BadgeCheck, Mic, MicOff, Video, VideoOff, Pin, PinOff } from "lucide-react";
import { useCallSettings } from '@/contexts/CallSettingsContext';
import { useSignalR } from "@/hooks/useSignalR";
import { AppConfig } from "../../../config";
interface VideoParticipantListProps {
  participants: any[];
  activeSpeakerId: string | null;
  pinnedParticipantId: string | null;
  onTogglePin: (participantId: string) => void;
}

export const VideoParticipantList: React.FC<VideoParticipantListProps> = ({
  participants,
  activeSpeakerId,
  pinnedParticipantId,
  onTogglePin,
}) => {
const { isMicOn, isVideoOn, toggleMic, toggleVideo } = useCallSettings();
const {PatientImage} = useSignalR();
const serverURL = AppConfig.baseUrl;
  return (
    <div className="w-72 bg-gray-900/80 backdrop-blur-sm border-l border-gray-800 hidden lg:block overflow-hidden animate-slide-up" style={{ animationDelay: "0.4s", opacity: 0 }}>
      <div className="px-4 py-3 border-b border-gray-800">
        <h3 className="text-white font-medium">Participants ({participants.length})</h3>
      </div>
      
      <div className="px-2 py-2 overflow-y-auto h-full max-h-[calc(100vh-10rem)]">
        {participants.map((participant, index) => {
          const isActive = participant.id === activeSpeakerId;
          const isPinned = participant.id === pinnedParticipantId;
          const delay = 0.5 + index * 0.1;
          
          return (
            <div 
              key={participant.id}
              className={`flex items-center gap-3 p-2 rounded-md mb-1 transition-colors ${
                isActive ? "bg-video-primary/20" : "hover:bg-gray-800/50"
              } ${isPinned ? "ring-1 ring-video-primary" : ""}`}
              style={{ animation: `slide-up 0.3s ease-out ${delay}s forwards`, opacity: 0 }}
            >
              {/* Avatar */}
              <div className="relative">
                {isVideoOn ? (
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-700">
                   {PatientImage !== undefined && PatientImage !== null ? 
                   (<img 
                   src={serverURL+PatientImage} 
                   alt="" className="h-full w-full object-cover" 
                   />) : (
                  <div className="h-10 w-10 rounded-full bg-video-secondary flex items-center justify-center text-white font-semibold">{participant.name.charAt(0)}</div>)}                     
                  
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-video-secondary flex items-center justify-center text-white font-semibold">
                    {participant.name.charAt(0)}
                  </div>
                )}
                
                {/* Active speaker indicator */}
                {isActive && (
                  <>
                    <span className="absolute inset-0 rounded-full animate-pulse-ring border-2 border-video-primary"></span>
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-gray-900"></span>
                  </>
                )}
              </div>
              
              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <span className="text-white text-sm font-medium truncate">
                    {participant.name} {participant.isSelf && '(You)'}
                  </span>
                  
                  {participant.isHost && (
                    <BadgeCheck size={14} className="ml-1 text-video-primary" />
                  )}
                </div>
                
                <div className="text-gray-400 text-xs">
                  {isActive ? "Speaking" : "Not speaking"}
                </div>
              </div>
              
              {/* Status icons */}
              <div className="flex items-center gap-1">
                {isMicOn ? (
                  <div className="p-1 rounded-full bg-gray-800 text-red-500">
                    <MicOff size={14} />
                  </div>
                ) : (
                  <div className="p-1 rounded-full bg-gray-800 text-green-500">
                    <Mic size={14} />
                  </div>
                )}
                
                {isVideoOn ? (
                  <div className="p-1 rounded-full bg-gray-800 text-green-500">
                    <Video size={14} />
                  </div>
                ) : (
                  <div className="p-1 rounded-full bg-gray-800 text-red-500">
                    <VideoOff size={14} />
                  </div>
                )}
                
                {/* Pin button */}
                <button 
                  onClick={() => onTogglePin(participant.id)}
                  className="p-1 rounded-full hover:bg-gray-800"
                >
                  {isPinned ? (
                    <PinOff size={14} className="text-video-primary" />
                  ) : (
                    <Pin size={14} className="text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};