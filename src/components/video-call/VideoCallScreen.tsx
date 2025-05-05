
// import React, { useState, useEffect } from "react";
// import { VideoContainer } from "./VideoContainer";
// import { VideoControls } from "./VideoControls";
// import { VideoParticipantList } from "./VideoParticipantList";
// import { VideoCallHeader } from "./VideoCallHeader";
// import { toast } from "sonner";
// import { formatDuration, getMockParticipants } from "../../services/agoraConfig";

// export const VideoCallScreen: React.FC = () => {
//   // Local state variables
//   const [participants, setParticipants] = useState(getMockParticipants(4));
//   const [isMuted, setIsMuted] = useState(false);
//   const [isVideoOn, setIsVideoOn] = useState(true);
//   const [isScreenSharing, setIsScreenSharing] = useState(false);
//   const [joinAnimation, setJoinAnimation] = useState(false);
//   const [activeSpeaker, setActiveSpeaker] = useState<string | null>("1"); // Mock active speaker
//   const [pinnedParticipantId, setPinnedParticipantId] = useState<string | null>(null);
//   const [callDuration, setCallDuration] = useState(0);
  
//   // Simulate join animation
//   useEffect(() => {
//     setTimeout(() => {
//       setJoinAnimation(true);
//     }, 500);
//   }, []);

//   // Call duration timer
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCallDuration(prev => prev + 1);
//     }, 1000);
    
//     return () => clearInterval(timer);
//   }, []);

//   // Simulate an active speaker change every 10 seconds
//   useEffect(() => {
//     const timer = setInterval(() => {
//       const randomParticipantId = Math.floor(Math.random() * participants.length).toString();
//       setActiveSpeaker(prev => prev === randomParticipantId ? null : randomParticipantId);
//     }, 10000);
    
//     return () => clearInterval(timer);
//   }, [participants.length]);

//   // Local control handlers
//   const toggleMute = () => {
//     setIsMuted(!isMuted);
    
//     // Update local participant
//     setParticipants(prev => 
//       prev.map(p => 
//         p.isSelf ? { ...p, isMuted: !isMuted } : p
//       )
//     );
    
//     toast(isMuted ? "Microphone turned on" : "Microphone muted");
//   };
  
//   const toggleVideo = () => {
//     setIsVideoOn(!isVideoOn);
    
//     // Update local participant
//     setParticipants(prev => 
//       prev.map(p => 
//         p.isSelf ? { ...p, isVideoOn: !isVideoOn } : p
//       )
//     );
    
//     toast(isVideoOn ? "Camera turned off" : "Camera turned on");
//   };
  
//   const toggleScreenShare = () => {
//     setIsScreenSharing(!isScreenSharing);
//     toast(isScreenSharing ? "Screen sharing stopped" : "Screen sharing started");
//   };
  
//   const togglePin = () => {
//     // Find self ID
//     const selfId = participants.find(p => p.isSelf)?.id;
//     if (pinnedParticipantId === selfId) {
//       setPinnedParticipantId(null);
//       toast("Your video unpinned");
//     } else {
//       setPinnedParticipantId(selfId || null);
//       toast("Your video pinned");
//     }
//   };
  
//   const togglePinForParticipant = (participantId: string) => {
//     if (pinnedParticipantId === participantId) {
//       setPinnedParticipantId(null);
//       toast("Video unpinned");
//     } else {
//       setPinnedParticipantId(participantId);
//       const participant = participants.find(p => p.id === participantId);
//       toast(`${participant?.name}'s video pinned`);
//     }
//   };
  
//   const leaveCall = () => {
//     toast.warning("Leaving call...");
    
//     setTimeout(() => {
//       window.location.href = "/";
//     }, 1500);
//   };
  
//   // Find self ID
//   const selfId = participants.find(p => p.isSelf)?.id;
//   const isSelfPinned = selfId === pinnedParticipantId;
  
//   return (
//     <div className={`flex flex-col h-screen bg-gray-950 text-[#93C5FD] transition-opacity duration-500 ${joinAnimation ? 'opacity-100' : 'opacity-0'}`}>
//       <VideoCallHeader 
//         callTitle="Team Weekly Sync"
//         participantCount={participants.length}
//         duration={formatDuration(callDuration)}
//       />
      
//       <div className="flex flex-1 overflow-hidden">
//         {/* Main video container */}
//         <VideoContainer 
//           participants={participants} 
//           activeSpeakerId={activeSpeaker}
//           isScreenSharing={isScreenSharing}
//           selfVideoEnabled={isVideoOn}
//           pinnedParticipantId={pinnedParticipantId}
//           onTogglePin={togglePinForParticipant}
//           className="flex-1"
//         />
        
//         {/* Participants sidebar */}
//         <VideoParticipantList 
//           participants={participants}
//           activeSpeakerId={activeSpeaker}
//           pinnedParticipantId={pinnedParticipantId}
//           onTogglePin={togglePinForParticipant}
//         />
//       </div>
      
//       {/* Controls */}
//       <VideoControls 
//         isMuted={isMuted}
//         isVideoOn={isVideoOn}
//         isScreenSharing={isScreenSharing}
//         isPinned={isSelfPinned}
//         onToggleMute={toggleMute}
//         onToggleVideo={toggleVideo}
//         onToggleScreenShare={toggleScreenShare}
//         onTogglePin={togglePin}
//         onLeaveCall={leaveCall}
//       />
//     </div>
//   );
// };

// export default VideoCallScreen;
