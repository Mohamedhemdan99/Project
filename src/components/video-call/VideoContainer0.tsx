
import React from "react";
import { cn } from "@/lib/utils";
import { Pin } from "lucide-react";
import { ParticipantVideo } from "./VideoParticipants0"; // Add import

interface VideoContainerProps {
  participants: any[];
  activeSpeakerId: string | null;
  isScreenSharing: boolean;
  selfVideoEnabled: boolean;
  pinnedParticipantId: string | null;
  onTogglePin: (participantId: string) => void;
  className?: string;
  audioLevels: { [key: string]: number };
}

export const VideoContainer: React.FC<VideoContainerProps> = ({
  participants,
  activeSpeakerId,
  isScreenSharing,
  selfVideoEnabled,
  audioLevels,
  pinnedParticipantId,
  onTogglePin,
  className,
}) => {
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
    return (
      <div className={cn("p-4 bg-video-dark flex flex-col", className)}>
        {isScreenSharing ? (
          <div className="flex flex-1 flex-col">
            {/* Screen share view */}
            <div className="relative flex-1 bg-black rounded-lg mb-2 overflow-hidden animate-scale-in">
              <div className="absolute inset-0 bg-gradient-to-b from-video-secondary/20 to-transparent"></div>
              <div className="absolute top-4 left-4 bg-video-dark/80 px-3 py-1 rounded-full text-white text-sm">
                Screen Share • {selfParticipant?.name}
              </div>
              <img 
                src="https://placehold.co/1920x1080/1A1F2C/9b87f5?text=Screen+Share&font=montserrat"
                alt="Screen Share" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Self video - replaced with ParticipantVideo */}
            <div className="h-32 w-48 bg-black rounded-lg overflow-hidden animate-slide-up self-end shadow-lg">
              <div className="relative h-full w-full">
                <div className={`absolute inset-0 flex items-center justify-center bg-video-dark ${selfVideoEnabled ? '' : 'bg-opacity-90'}`}>
                  <ParticipantVideo participant={selfParticipant} />
                </div>
              </div>
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
                  className={`relative bg-video-dark rounded-lg overflow-hidden transition-all duration-300`}
                  style={{ 
                    gridArea,
                    animation: `scale-in 0.5s ease-out ${delay}s forwards`,
                    opacity: 0
                  }}
                >
                 <div className={`absolute inset-0 ${isActive ? 'ring-2 ring-video-primary' : ''} ${isPinned ? 'ring-2 ring-video-primary' : ''} rounded-lg`}>
                 <ParticipantVideo participant={participant} />
                 </div>
                  
                  {/* Active speaker indicator */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-video-primary/20">
                    <div 
                      className="h-full bg-video-primary transition-all duration-100"
                      style={{ 
                        width: `${audioLevels[participant.id] || 0}%`,
                        opacity: audioLevels[participant.id] ? 0.8 : 0 
                      }}
                    />
                  </div>
                  
                  {/* Pin button */}
                  <button
                    onClick={() => onTogglePin(participant.id)}
                    className="absolute top-2 right-2 p-2 bg-video-dark/80 hover:bg-video-dark rounded-full shadow-md z-10"
                  >
                    <Pin 
                      size={16} 
                      className={isPinned ? "text-video-primary" : "text-white"}
                      fill={isPinned ? "#9b87f5" : "none"} 
                    />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };
  
  //   return (
  //     <div className={cn("p-4 bg-video-dark flex flex-col", className)}>
  //       {isScreenSharing ? (
  //         <div className="flex flex-1 flex-col">
  //           {/* Screen share view */}
  //           <div className="relative flex-1 bg-black rounded-lg mb-2 overflow-hidden animate-scale-in">
  //             <div className="absolute inset-0 bg-gradient-to-b from-video-secondary/20 to-transparent"></div>
  //             <div className="absolute top-4 left-4 bg-video-dark/80 px-3 py-1 rounded-full text-white text-sm">
  //               Screen Share • {selfParticipant?.name}
  //             </div>
  //             <img 
  //               src="https://placehold.co/1920x1080/1A1F2C/9b87f5?text=Screen+Share&font=montserrat"
  //               alt="Screen Share" 
  //               className="w-full h-full object-cover"
  //             />
  //           </div>
            
  //           {/* Small video of presenter */}
  //           <div className="h-32 w-48 bg-black rounded-lg overflow-hidden animate-slide-up self-end shadow-lg">
  //             <div className="relative h-full w-full">
  //               <div className={`absolute inset-0 flex items-center justify-center bg-video-dark ${selfVideoEnabled ? '' : 'bg-opacity-90'}`}>
  //                 {selfVideoEnabled ? (
  //                   <img 
  //                     src={`https://placehold.co/640x480/1A1F2C/9b87f5?text=${selfParticipant?.name}&font=montserrat`}
  //                     alt={selfParticipant?.name}
  //                     className="w-full h-full object-cover"
  //                   />
  //                 ) : (
  //                   <div className="h-16 w-16 rounded-full bg-video-primary flex items-center justify-center text-white text-xl font-semibold">
  //                     {selfParticipant?.name?.charAt(0)}
  //                   </div>
  //                 )}
  //               </div>
                
  //               {/* Participant name label */}
  //               <div className="absolute bottom-2 left-2 right-2 flex items-center">
  //                 <div className="text-white text-xs bg-black/60 px-2 py-1 rounded-full">
  //                   {selfParticipant?.name} (You)
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       ) : (
  //         <div 
  //           className="grid flex-1 gap-2 overflow-hidden"
  //           style={{
  //             gridTemplateAreas: getGridTemplateAreas(),
  //             gridTemplateColumns: getGridTemplateColumns(),
  //             gridTemplateRows: getGridTemplateRows(),
  //           }}
  //         >
  //           {displayParticipants.map((participant, index) => {
  //             const isActive = participant.id === activeSpeakerId;
  //             const isPinned = participant.id === pinnedParticipantId;
  //             const gridArea = isPinned || index === 0 ? "main" : `secondary${index}`;
  //             const delay = index * 0.15;
              
  //             return (
  //               <div 
  //                 key={participant.id} 
  //                 className={`relative bg-video-dark rounded-lg overflow-hidden transition-all duration-300`}
  //                 style={{ 
  //                   gridArea,
  //                   animation: `scale-in 0.5s ease-out ${delay}s forwards`,
  //                   opacity: 0
  //                 }}
  //               >
  //                 <div className={`absolute inset-0 ${isActive ? 'ring-2 ring-video-primary' : ''} ${isPinned ? 'ring-2 ring-video-primary' : ''} rounded-lg`}>
  //                   {participant.isVideoOn ? (
  //                     <img 
  //                       src={`https://placehold.co/640x480/${participant.isSelf ? '1A1F2C/9b87f5' : '1A1F2C/7E69AB'}?text=${participant.name}&font=montserrat`}
  //                       alt={participant.name}
  //                       className="w-full h-full object-cover"
  //                     />
  //                   ) : (
  //                     <div className="h-full w-full flex items-center justify-center bg-video-dark">
  //                       <div className="h-24 w-24 rounded-full bg-video-secondary flex items-center justify-center text-white text-4xl font-semibold">
  //                         {participant.name.charAt(0)}
  //                       </div>
  //                     </div>
  //                   )}
  //                 </div>
                  
  //                 {/* Active speaker indicator */}
  //                 {isActive && !isPinned && (
  //                   <div className="absolute inset-0 border-2 border-video-primary rounded-lg animate-pulse"></div>
  //                 )}
                  
  //                 {/* Pin button */}
  //                 <button
  //                   onClick={() => onTogglePin(participant.id)}
  //                   className="absolute top-2 right-2 p-2 bg-video-dark/80 hover:bg-video-dark rounded-full shadow-md z-10"
  //                 >
  //                   <Pin 
  //                     size={16} 
  //                     className={isPinned ? "text-video-primary" : "text-white"}
  //                     fill={isPinned ? "#9b87f5" : "none"} 
  //                   />
  //                 </button>
                  
  //                 {/* Participant name and controls */}
  //                 <div className="absolute bottom-2 left-2 right-2 flex items-center">
  //                   <div className="text-white text-sm bg-black/60 px-2 py-1 rounded-full flex items-center gap-1">
  //                     {participant.isHost && (
  //                       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-video-primary">
  //                         <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  //                       </svg>
  //                     )}
  //                     {participant.name} {participant.isSelf && '(You)'}
  //                   </div>
  //                 </div>
  //               </div>
  //             );
  //           })}
  //         </div>
  //       )}
  //     </div>
  //   );
  // };

