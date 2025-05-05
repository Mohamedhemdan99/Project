
import React from "react";
import { Clock } from "lucide-react";

interface VideoCallHeaderProps {
  callTitle: string;
  participantCount: number;
  duration: string;
}

export const VideoCallHeader: React.FC<VideoCallHeaderProps> = ({
  callTitle,
  participantCount,
  duration,
}) => {
  return (
    <div className="bg-video-dark border-b border-gray-200 py-3 px-6 flex items-center animate-slide-down shadow-sm" >
      <div className="flex items-center">
        <h1 className="text-gray-800 text-lg font-medium">{callTitle}</h1>
        <div className="h-6 border-l border-gray-300 mx-4"></div>
        <div className="bg-blue-50 rounded-full px-3 py-1 text-blue-700 text-sm">
          
          {participantCount} {participantCount === 1 ? "participant" : "participants"}
        </div>
      </div>
      
      <div className="ml-auto flex items-center">
        <div className="bg-blue-50 rounded-full px-3 py-1 flex items-center gap-1 text-blue-700 text-sm">
          <Clock size={14} strokeWidth={2.5} />
          
          <span>{duration}</span>
        </div>
      </div>
    </div>
  );
};
