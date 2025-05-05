import React, { useState, useEffect, useRef } from "react";
import { VideoContainer } from "../components/video-call/VideoContainer";
import { VideoControls } from "../components/video-call/VideoControls";
import { VideoParticipantList } from "../components/video-call/VideoParticipantList";
import { VideoCallHeader } from "../components/video-call/VideoCallHeader";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import AgoraRTC, { IAgoraRTCClient, ILocalTrack, IRemoteTrack } from "agora-rtc-sdk-ng";
import { useSignalR } from "@/hooks/useSignalR";
import api from "@/services/axiosService";

export const VideoCallScreen: React.FC = () => {
  const [participants, setParticipants] = useState<any[]>([]);
  const [isCallConnected, setIsCallConnected] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [pinnedParticipantId, setPinnedParticipantId] = useState<string | null>(null);
  const navigate = useNavigate();
  const clientRef = useRef(null);
  const { AppId, ChannelName, Uid } = useSignalR();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [localAudioTrack, setLocalAudioTrack] = useState<ILocalTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ILocalTrack | null>(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [audioLevels, setAudioLevels] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    clientRef.current = client;
    console.log("uid", Uid)
    AgoraRTC.setLogLevel(0);
    const joinChannel = async () => {
      try {
        await client.join(AppId, ChannelName, null, Uid);

        // Create and publish local tracks
        const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        microphoneTrack.setEnabled(false);
        cameraTrack.setEnabled(false);
        setLocalAudioTrack(microphoneTrack);
        setLocalVideoTrack(cameraTrack);
        
        console.log(await client.publish([microphoneTrack, cameraTrack]));

        // Initialize local participant
        setParticipants([
          {
            id: Uid,
            name: "You",
            isSelf: true,
            isMuted: !isMicOn,
            isVideoOn: isVideoOn,
            videoTrack: cameraTrack,
            audioTrack: microphoneTrack,
          },
        ]);

        // Enable active speaker detection
        client.enableAudioVolumeIndicator();
        
        // Listen for active speaker
        client.on("active-speaker", (uid) => {
          console.log("Active speaker:", uid);
          setActiveSpeaker(uid);
        });

        // Set up volume indicator
        client.on("volume-indicator", (volumes) => {
          const levels: { [key: string]: number } = {};
          volumes.forEach((volume) => {
            levels[volume.uid] = Math.min(100, Math.round(volume.level * 1.2));
          });
          setAudioLevels(levels);
        });

        // Handle remote user joining - FIXED THIS PART
        client.on("user-joined", (user) => {
          console.log("User joined:", user.uid);
          // Add user to participants even before they publish media
          setParticipants((prev) => {
            // Check if the user already exists in the participant list
            if (!prev.find(p => p.id === user.uid)) {
              return [
                ...prev,
                {
                  id: user.uid,
                  name: `User ${user.uid}`,
                  isSelf: false,
                  isMuted: true,
                  isVideoOn: false,
                  videoTrack: null,
                  audioTrack: null,
                }
              ];
            }
            return prev;
          });
        });

        // Handle remote user publishing media
        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          
          setParticipants((prev) => {
            const existing = prev.find((p) => p.id === user.uid);
            
            if (existing) {
              // Update existing participant with new track information
              return prev.map((p) => {
                if (p.id === user.uid) {
                  const updates = {
                    ...p,
                    name: p.name || `User ${user.uid}`,
                  };
                  
                  if (mediaType === "video") {
                    updates.videoTrack = user.videoTrack;
                    updates.isVideoOn = true;
                  }
                  
                  if (mediaType === "audio") {
                    updates.audioTrack = user.audioTrack;
                    updates.isMuted = false;
                    // Play the audio
                    user.audioTrack?.play();
                  }
                  
                  return updates;
                }
                return p;
              });
            } else {
              // Create new participant if they don't exist yet
              const newParticipant = {
                id: user.uid,
                name: `User ${user.uid}`,
                isSelf: false,
                isMuted: mediaType !== "audio",
                isVideoOn: mediaType === "video",
                videoTrack: mediaType === "video" ? user.videoTrack : null,
                audioTrack: mediaType === "audio" ? user.audioTrack : null,
              };
              
              // Play audio if available
              if (mediaType === "audio") {
                user.audioTrack?.play();
              }
              
              return [...prev, newParticipant];
            }
          });
        });

        // Handle remote user unpublishing media
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

        // Handle remote user leaving the call
        client.on("user-left", (user) => {
          console.log("User left:", user.uid);
          setParticipants((prev) => prev.filter((p) => p.id !== user.uid));
        });

        toast.success("Connected to call");
        setIsCallConnected(true);
      } catch (error) {
        console.error("Failed to join channel", error);
        toast.error("Failed to connect to call");
      }
    };

    joinChannel();

    return () => {
      if (clientRef.current) {
        clientRef.current.off("active-speaker");
        clientRef.current.off("volume-indicator");
        clientRef.current.leave();
      }
    };
  }, [AppId, ChannelName, Uid]);

  // Timer for call duration
  useEffect(() => {
    if (isCallConnected) {
      const timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isCallConnected]);

  // Pin active speaker
  useEffect(() => {
    if (activeSpeaker && activeSpeaker !== pinnedParticipantId) {
      setPinnedParticipantId(activeSpeaker);
    }
  }, [activeSpeaker, pinnedParticipantId]);

  // Toggle local mic
  useEffect(() => {
    if (localAudioTrack) {
      localAudioTrack.setEnabled(isMicOn);
      setParticipants((prev) =>
        prev.map((p) => (p.isSelf ? { ...p, isMuted: !isMicOn } : p))
      );
    }
  }, [isMicOn, localAudioTrack]);

  // Toggle local camera
  useEffect(() => {
    if (localVideoTrack) {
      localVideoTrack.setEnabled(isVideoOn);
      setParticipants((prev) =>
        prev.map((p) => (p.isSelf ? { ...p, isVideoOn } : p))
      );
    }
  }, [isVideoOn, localVideoTrack]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleMic = () => setIsMicOn((prev) => !prev);
  const toggleVideo = () => setIsVideoOn((prev) => !prev);

  
  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenTrack = await AgoraRTC.createScreenVideoTrack({
          encoderConfig: {
            width: 1920,
            height: 1080,
            frameRate: 30,
            bitrateMax: 1000,
          },
        }, 'disable');
        
        if (localVideoTrack) {
          await clientRef.current?.unpublish(localVideoTrack);
        }
        
        await clientRef.current?.publish(screenTrack);
        setLocalVideoTrack(screenTrack);
        setIsScreenSharing(true);
        toast("Screen sharing started");
      } catch (error) {
        console.error("Failed to start screen sharing", error);
        toast.error("Failed to start screen sharing");
      }
    } else {
      try {
        const cameraTrack = await AgoraRTC.createCameraVideoTrack();
        
        if (localVideoTrack) {
          await clientRef.current?.unpublish(localVideoTrack);
        }
        
        await clientRef.current?.publish(cameraTrack);
        setLocalVideoTrack(cameraTrack);
        setIsScreenSharing(false);
        toast("Screen sharing stopped");
      } catch (error) {
        console.error("Failed to stop screen sharing", error);
        toast.error("Failed to stop screen sharing");
      }
    }
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
    if (!ChannelName) {
      window.location.href = "/home";
      return;
    }
    
    try {
      await api.post(`/api/calls/${ChannelName}/end`);
    } catch (error) {
      console.error("Error ending call", error);
    }
    
    if (clientRef.current) {
      clientRef.current.leave();
    }
    
    window.location.href = "/home";
  };

  const selfId = participants.find((p) => p.isSelf)?.id;
  const isSelfPinned = selfId === pinnedParticipantId;

  return (
    <div className="flex flex-col h-screen bg-video-dark">
      <VideoCallHeader
        callTitle="Be With Me"
        participantCount={participants.length}
        duration={formatDuration(elapsedSeconds)}
      />
      <div className="flex flex-1 overflow-hidden">
        <VideoContainer
          audioLevels={audioLevels}
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
          audioLevels={audioLevels}
          onTogglePin={togglePinForParticipant}
        />
      </div>
      <VideoControls
        isScreenSharing={isScreenSharing}
        isPinned={isSelfPinned}
        isMicOn={isMicOn}
        isVideoOn={isVideoOn}
        onToggleMute={toggleMic}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onTogglePin={togglePin}
        onLeaveCall={leaveCall}
      />
    </div>
  );
};

export default VideoCallScreen;