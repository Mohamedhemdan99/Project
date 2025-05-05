
import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Pin } from "lucide-react";
import { AppConfig } from "../../../config";

interface VideoContainerProps {
  participants: any[];
  activeSpeakerId: string | null;
  isScreenSharing: boolean;
  selfVideoEnabled: boolean;
  pinnedParticipantId: string | null;
  onTogglePin: (participantId: string) => void;
  className?: string;
}

export const VideoContainer: React.FC<VideoContainerProps> = ({
  participants,
  activeSpeakerId,
  isScreenSharing,
  selfVideoEnabled,
  pinnedParticipantId,
  onTogglePin,
  className,
}) => {
  useEffect(() => {
    return () => {
      participants.forEach(p => {
        if (p.videoTrack && !p.isSelf) {
          p.videoTrack.stop();
          p.videoTrack.close();
        }
      });
    };
  }, [participants]);
  const serverURL = AppConfig.baseUrl;
  // Get self participant
  const selfParticipant = participants.find(p => p.isSelf);
  
  // Get pinned participant
  const pinnedParticipant = pinnedParticipantId 
    ? participants.find(p => p.id === pinnedParticipantId) 
    : null;
  
  // Get other participants (excluding pinned if exists)
  const otherParticipants = participants.filter(p => 
    !p.isSelf && (!pinnedParticipantId || p.id !== pinnedParticipantId)
  );
  
  // Determine layout based on participant count and pinned status
  const getGridTemplateAreas = () => {
    if (pinnedParticipantId) return "main";
    
    const count = participants.length;
    if (count <= 1) return `"main"`;
    if (count <= 4) return `"main main" "secondary1 secondary2"`;
    return `"main main secondary1" "main main secondary2" "secondary3 secondary4 secondary5"`;
  };
  
  const getGridTemplateColumns = () => {
    if (pinnedParticipantId) return "1fr";
    
    const count = participants.length;
    if (count <= 1) return "1fr";
    if (count <= 4) return "1fr 1fr";
    return "1fr 1fr 1fr";
  };
  
  const getGridTemplateRows = () => {
    if (pinnedParticipantId) return "1fr";
    
    const count = participants.length;
    if (count <= 1) return "1fr";
    if (count <= 4) return "2fr 1fr";
    return "1.5fr 1.5fr 1fr";
  };
  
  // Determine which participants to display in grid view
  const displayParticipants = pinnedParticipantId
    ? [pinnedParticipant]
    : participants;
    
  // Function to render video placeholder
  const renderVideoPlaceholder = (participant: any) => {
    if (!participant) return null;
    
    // ✅ Show video if available
    if (participant.isVideoOn && participant.videoTrack) {
      return (
        <video
          ref={(el) => {
            if (el && participant.videoTrack) {
              participant.videoTrack.play(el); // Attach Agora video track
            }
          }}
          className="h-full w-full object-cover"
          autoPlay
          playsInline
        />
      );
    }
    
    // Default placeholder when video is off
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-900">
        <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-semibold">
          <img src={serverURL + participant.imageURL} alt="" className="w-full h-full object-cover"/>
          {/* {participant?.name?.charAt(0)} */}
        </div>
      </div>
    );
  };
  
  return (
    <div className={cn("p-4 bg-gray-900 flex flex-col", className)}>
      {isScreenSharing ? (
        <div className="flex flex-1 flex-col">
          {/* Screen share view */}
          <div className="relative flex-1 bg-gray-800 rounded-lg mb-2 overflow-hidden animate-scale-in">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent"></div>
            <div className="absolute top-4 left-4 bg-gray-900/90 px-3 py-1 rounded-full text-[#93C5FD] text-sm shadow-md">
              Screen Share • {selfParticipant?.name}
            </div>
            {/* Design mockup of screen share content */}
            <div className="w-full h-full bg-black">
              {selfParticipant?.videoTrack && (
                <video
                  ref={(el) => {
                    if (el && selfParticipant?.videoTrack) {
                      selfParticipant.videoTrack.play(el); // Attach screen share track
                    }
                  }}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                />
              )}
            </div>
          </div>
          
          {/* Small video of presenter */}
          <div className="h-32 w-48 bg-gray-800 rounded-lg overflow-hidden animate-slide-up self-end shadow-lg">
            {selfParticipant && (
              <div className="relative h-full w-full">
                {renderVideoPlaceholder(selfParticipant)}
                
                {/* Participant name label */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center">
                  <div className="text-white text-xs bg-gray-900/90 px-2 py-1 rounded-full shadow-sm">
                    {selfParticipant.name} (You)
                  </div>
                  <div className="ml-auto flex space-x-1">
                    {selfParticipant.isMuted && (
                      <div className="bg-red-500/90 p-1 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <path d="m2 2 20 20"></path>
                          <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2a7 7 0 0 0-14 0v2a7 7 0 0 0 .68 3"></path>
                          <path d="M8 22h8"></path>
                          <path d="M12 19v3"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div 
          className="grid flex-1 gap-2 overflow-hidden"
          style={{
            gridTemplateAreas: getGridTemplateAreas(),
            gridTemplateColumns: getGridTemplateColumns(),
            gridTemplateRows: getGridTemplateRows(),
          }}
        >
          {displayParticipants.map((participant, index) => {
            const isActive = participant.id === activeSpeakerId;
            const isPinned = participant.id === pinnedParticipantId;
            const gridArea = isPinned || index === 0 ? "main" : `secondary${index}`;
            const delay = index * 0.15;
            
            return (
              <div 
                key={participant.id} 
                className={`relative bg-gray-800 rounded-lg overflow-hidden transition-all duration-300`}
                style={{ 
                  gridArea,
                  animation: `scale-in 0.5s ease-out ${delay}s forwards`,
                  opacity: 0
                }}
                id={`container-${participant.id}`}
              >
                <div className={`absolute inset-0 ${isActive ? 'ring-2 ring-[#93C5FD]' : ''} ${isPinned ? 'ring-2 ring-[#93C5FD]' : ''} rounded-lg`}>
                  {renderVideoPlaceholder(participant)}
                </div>
                
                {/* Active speaker indicator */}
                {isActive && !isPinned && (
                  <div className="absolute inset-0 border-2 border-[#93C5FD] rounded-lg animate-pulse"></div>
                )}
                
                {/* Pin button */}
                <button
                  onClick={() => onTogglePin(participant.id)}
                  className="absolute top-2 right-2 p-2 bg-gray-900/80 hover:bg-gray-800 rounded-full shadow-md z-10"
                >
                  <Pin 
                    size={16} 
                    className={isPinned ? "text-[#93C5FD]" : "text-gray-400"}
                    fill={isPinned ? "#93C5FD" : "none"} 
                  />
                </button>
                
                {/* Participant name and controls */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center">
                  <div className="text-white text-sm bg-gray-900/90 px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                    {participant.isHost && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#93C5FD]">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    )}
                    {participant.name} {participant.isSelf && '(You)'}
                  </div>
                  <div className="ml-auto flex space-x-1">
                    {participant.isMuted && (
                      <div className="bg-red-500/90 p-1 rounded-full shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <path d="m2 2 20 20"></path>
                          <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2a7 7 0 0 0-14 0v2a7 7 0 0 0 .68 3"></path>
                          <path d="M8 22h8"></path>
                          <path d="M12 19v3"></path>
                        </svg>
                      </div>
                    )}
                    {!participant.isVideoOn && (
                      <div className="bg-red-500/90 p-1 rounded-full shadow-sm ml-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <path d="M10.66 6H14c2.21 0 4 1.79 4 4v7"></path>
                          <path d="m2 2 20 20"></path>
                          <path d="M6.26 6.26A3 3 0 0 0 6 7v10c0 1.66 1.34 3 3 3h7c.38 0 .73-.09 1.05-.24"></path>
                          <path d="M22 9l-4 4V7l4-4v6z"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Display smaller thumbnails of other participants if someone is pinned */}
      {pinnedParticipantId && otherParticipants.length > 0 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
          {otherParticipants.map((participant) => {
            return (
              <div 
                key={participant.id}
                className="relative h-20 w-32 flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden shadow-md cursor-pointer"
                onClick={() => onTogglePin(participant.id)}
                id={`thumbnail-${participant.id}`}
              >
                {renderVideoPlaceholder(participant)}
                
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="text-xs text-white bg-gray-900/90 px-1 py-0.5 rounded truncate text-center">
                    {participant.name}
                  </div>
                </div>
                
                {participant.id === activeSpeakerId && (
                  <div className="absolute inset-0 border border-[#93C5FD] rounded-lg"></div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
