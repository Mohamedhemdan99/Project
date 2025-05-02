
import React, { useState, useEffect, useRef } from "react";
import { VideoContainer } from "../components/video-call/VideoContainer";
import { VideoControls } from "../components/video-call/VideoControls";
import { VideoParticipantList } from "../components/video-call/VideoParticipantList";
import { VideoCallHeader } from "../components/video-call/VideoCallHeader";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useSignalR } from "@/hooks/useSignalR";
import api from "@/services/axiosService";
import { CallSettingsProvider } from "@/contexts/CallSettingsContext";


export const VideoCallScreen: React.FC = () => {
  const [participants, setParticipants] = useState<any[]>([]);
  const [isCallConnected, setIsCallConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [joinAnimation, setJoinAnimation] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [pinnedParticipantId, setPinnedParticipantId] = useState<string | null>(null);
  const navigate = useNavigate();
  const clientRef = useRef<any>(null);
  const {AppId, ChannelName,Uid} = useSignalR();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [localAudioTrack, setLocalAudioTrack] = useState<any>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<any>(null);
  
  // Simulate connecting to a call
  useEffect(() => {
    console.log("Appid",AppId);
    console.log("ChannelName",ChannelName);
    console.log("Uid",Uid);
    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    clientRef.current = client;
    const joinChannel = async () => {
      try {
        const appId = AppId; // Replace with your Agora App ID
        const token = null; // Replace with your Agora Token
        await client.join(AppId, ChannelName, token, Uid);

        const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalAudioTrack(microphoneTrack);
        setLocalVideoTrack(cameraTrack);
        await client.publish([microphoneTrack, cameraTrack]);

        setParticipants([
          {
            id: "local",
            name: "You",
            isSelf: true,
            isMuted: false,
            isVideoOn: true,
            videoTrack: cameraTrack,
            audioTrack: microphoneTrack,
            
          },
        ]);
        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === "video") {
            setParticipants((prev) => {
              const existing = prev.find((p) => p.id === user.uid);
              if (existing) {
                return prev.map((p) =>
                  p.id === user.uid ? { ...p, videoTrack: user.videoTrack, isVideoOn: true } : p
                );
              } else {
                return [
                  ...prev,
                  {
                    id: user.uid,
                    name: `User ${user.uid}`,
                    isSelf: false,
                    isMuted: !user.audioTrack,
                    isVideoOn: true,
                    videoTrack: user.videoTrack,
                    audioTrack: user.audioTrack,
                  },
                ];
              }
            });
          }
          if (mediaType === "audio") {
            user.audioTrack.play();
            setParticipants((prev) =>
              prev.map((p) =>
                p.id === user.uid ? { ...p, audioTrack: user.audioTrack, isMuted: false } : p
              )
            );
          }
        });

        client.on("user-unpublished", (user, mediaType) => {
          if (mediaType === "video") {
            setParticipants((prev) =>
              prev.map((p) =>
                p.id === user.uid ? { ...p, videoTrack: null, isVideoOn: false } : p
              )
            );
          }
          if (mediaType === "audio") {
            setParticipants((prev) =>
              prev.map((p) =>
                p.id === user.uid ? { ...p, audioTrack: null, isMuted: true } : p
              )
            );
          }
        });

        client.on("user-left", (user) => {
          setParticipants((prev) => prev.filter((p) => p.id !== user.uid));
        });

        toast.success("Connected to call");
      } catch (error) {
        console.error("Failed to join channel", error);
        toast.error("Failed to connect to call");
      }
    };

   
    joinChannel();

    return () => {
      if (clientRef.current) {
        clientRef.current.leave();
      }
    };
  }, [ChannelName]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {

    const newMuted = !isMuted;
    if (localAudioTrack) {
      localAudioTrack.setEnabled(!newMuted);
    }
    setIsMuted(newMuted);
    toast(newMuted ? "Microphone muted" : "Microphone turned on");
  };

  const toggleVideo = () => {
    const newVideoOn = !isVideoOn;
    if (localVideoTrack) {
      localVideoTrack.setEnabled(newVideoOn);
    }
    setIsVideoOn(newVideoOn);
    toast(newVideoOn ? "Camera turned on" : "Camera turned off");
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    toast(isScreenSharing ? "Screen sharing stopped" : "Screen sharing started");
  };

  const togglePin = () => {
    const selfId = participants.find((p) => p.isSelf)?.id;
    if (pinnedParticipantId === selfId) {
      setPinnedParticipantId(null);
      toast("Your video unpinned");
    } else {
      setPinnedParticipantId(selfId);
      toast("Your video pinned");
    }
  };

  const togglePinForParticipant = (participantId: string) => {
    if (pinnedParticipantId === participantId) {
      setPinnedParticipantId(null);
      toast("Video unpinned");
    } else {
      setPinnedParticipantId(participantId);
      const participant = participants.find((p) => p.id === participantId);
      toast(`${participant?.name}'s video pinned`);
    }
  };

  const leaveCall = async () => {
    // call api to leave call
      if(!ChannelName){
        window.location.href = "/home";
      }
      const response =await api.post(`/api/calls/${ChannelName}/end`)
    
      clientRef.current?.leave();
        window.location.href = "/home";
     
  };

  const selfId = participants.find((p) => p.isSelf)?.id;
  const isSelfPinned = selfId === pinnedParticipantId;

  return (
    <div className="flex flex-col h-screen bg-video-dark">
      <CallSettingsProvider>
      <VideoCallHeader
        callTitle="Be With Me"
        participantCount={participants.length}
        duration={formatDuration(elapsedSeconds)}
        />
      <div className="flex flex-1 overflow-hidden">
        <VideoContainer
          participants={participants}
          activeSpeakerId={activeSpeaker}
          isScreenSharing={isScreenSharing}
          selfVideoEnabled={isVideoOn}
          pinnedParticipantId={pinnedParticipantId}
          onTogglePin={togglePinForParticipant}
          className="flex-1"
        />
        <VideoParticipantList
          participants={participants}
          activeSpeakerId={activeSpeaker}
          pinnedParticipantId={pinnedParticipantId}
          onTogglePin={togglePinForParticipant}
        />
      </div>
      <VideoControls
        isScreenSharing={isScreenSharing}
        isPinned={isSelfPinned}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onTogglePin={togglePin}
        onLeaveCall={leaveCall}
      />
      </CallSettingsProvider>
      </div>
  );
};

export default VideoCallScreen;