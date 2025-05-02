
import React from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, Phone, Share, Users, MessageSquare, MoreVertical, Pin } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCallSettings } from '@/contexts/CallSettingsContext';

interface VideoControlsProps {
  isScreenSharing: boolean;
  isPinned: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onTogglePin: () => void;
  onLeaveCall: () => void;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
  // localParticipant,
  isScreenSharing,
  isPinned,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onTogglePin,
  onLeaveCall,
}) => {
const { isMicOn, isVideoOn, toggleMic, toggleVideo } = useCallSettings();
  return (
    <div className="bg-video-dark border-t border-gray-800 py-4 px-6 flex items-center justify-center animate-slide-up" style={{ animationDelay: "0.3s", opacity: 0 }}>
      <div className="flex items-center justify-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full p-3 ${isMicOn ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-700 text-white hover:bg-gray-600"}`}
                onClick={toggleMic}
              >
                {isMicOn ? <MicOff size={24} /> : <Mic size={24} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isMicOn ? "Unmute" : "Mute"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full p-3 ${isVideoOn ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-red-500 text-white hover:bg-red-600"}`}
                onClick={toggleVideo}
              >
                {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isVideoOn ? "Turn off camera" : "Turn on camera"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full p-3 ${isScreenSharing ? "bg-video-primary text-white hover:bg-video-secondary" : "bg-gray-700 text-white hover:bg-gray-600"}`}
                onClick={() => {}}
                // disabled={true}
              >
                <Share size={24} />
              </Button>
            </TooltipTrigger>

            <TooltipContent >
              
              {/* <p>{isScreenSharing ? "Stop screen sharing" : "Share screen"}</p> */}
              <p>Share screen Soon</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full p-3 ${isPinned ? "bg-video-primary text-white hover:bg-video-secondary" : "bg-gray-700 text-white hover:bg-gray-600"}`}
                onClick={onTogglePin}
              >
                <Pin size={24} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {/* <p>{isPinned ? "Unpin" : "Pin your video"}</p> */}
              <p>Pin your video Soon</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full p-3 bg-gray-700 text-white hover:bg-gray-600"
                onClick={() => {}}
              >
                <Users size={24} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {/* <p>Participants</p> */}
              <p>Participants Soon</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full p-3 bg-gray-700 text-white hover:bg-gray-600"
                onClick={() => {}}
              >
                <MessageSquare size={24} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {/* <p>Chat</p> */}
              <p>Chat Soon</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full p-3 bg-gray-700 text-white hover:bg-gray-600"
                onClick={() => {}}
              >
                <MoreVertical size={24} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {/* <p>More options</p> */}
              <p>More options Soon</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="h-10 border-l border-gray-600 mx-2"></div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full p-3 bg-red-500 text-white hover:bg-red-600"
                onClick={onLeaveCall}
              >
                <Phone size={24} className="rotate-[135deg]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Leave call</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
