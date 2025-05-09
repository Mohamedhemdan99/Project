import VideoCallScreen from "./VideoCallScreen";
import { useSignalR } from "@/hooks/useSignalR";
import { Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Navigate, useNavigate } from "react-router-dom";
import api from "@/services/axiosService";
import { AppConfig } from "../../config";

const serverURL = AppConfig.baseUrl;

const ReceiveCall = () => {
  const [isInCall, setIsInCall] = useState(false);
  const [callerInfo, setCallerInfo] = useState(null);
  const { hasAcall, PatientName, setHasAcall, ChannelName, AppId, Uid, PatientImage } = useSignalR();
  const navigate = useNavigate();
  const audioRef = useRef(new Audio("/assets/google_meet_Ring.mp3")); // Add your ringtone to public/assets folder
  
 // Play ringtone when component mounts and hasAcall is true
 useEffect(() => {
  if (hasAcall && audioRef.current) {
    audioRef.current.loop = true;
    audioRef.current.play().catch(err => console.error("Error playing ringtone:", err));
  }
  
  // Cleanup function to stop the ringtone
  return () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };
}, [hasAcall]);

  useEffect(() => {
    if (isInCall) {
      setHasAcall(false);
      navigate('/VideoCallScreen');
    }
  }, [isInCall, navigate, setHasAcall]);

  if (!hasAcall) return null;


const handleAccept = async () => {
  try {
    // First, join the call on the backend
    const roomName = ChannelName;
    const appId = AppId;
    const uid = Uid;
    
    const response = await api.post(`/api/calls/join-call`, { roomName, appId, uid });
    
    if (response.status === 200) {
      console.log("Successfully joined call on backend", response.data);
      // Stop the ringtone
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Wait a short moment to ensure WebSocket connection is stable
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Now set the states to trigger navigation
      setIsInCall(true);
      setHasAcall(true);
    } else {
      console.error("Failed to join call on backend:", response.data);
      throw new Error("Failed to join call");
    }
  } catch (error) {
    console.error("Error joining call:", error);
    setHasAcall(false);
    setIsInCall(false);
  }
};



const handleReject = () => {
  // Stop the ringtone
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }
  
  setHasAcall(false);
  navigate("/home");
};

return (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="max-w-md w-full mx-4 p-8 bg-white/90 backdrop-blur-lg rounded-xl shadow-lg text-center">
      <div className="mb-8">
        <div className="relative h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6 animate-vibrate">
          {PatientImage ? (
            <img 
              src={serverURL + PatientImage} 
              alt={PatientName} 
              className="h-full w-full rounded-full object-cover animate-vibrate" 
            />
          ) : (
            <Video className="h-12 w-12 text-blue-500" />
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Incoming Call</h1>
        <p className="text-gray-600">{PatientName || 'Someone'} is calling you...</p>
      </div>

      <div className="flex gap-4">
        <Button 
          onClick={handleAccept} 
          variant="default"
          className="flex-1 py-6 text-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300"
        >
          Accept
        </Button>
        <Button 
          onClick={handleReject}
          variant="destructive"
          className="flex-1 py-6 text-lg bg-red-500 hover:bg-red-600 text-white transition-all duration-300"
        >
          Reject
        </Button>
      </div>
    </div>
  </div>
);
};

export default ReceiveCall;
//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="max-w-md w-full mx-4 p-8 bg-white/90 backdrop-blur-lg rounded-xl shadow-lg text-center">
//         <div className="mb-8">
//           <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
//             <Video className="h-12 w-12 text-blue-500" />
//             <img src={serverURL+PatientImage} alt={PatientName} />
//           </div>
//           <h1 className="text-3xl font-bold text-gray-800 mb-2">Incoming Call</h1>
//           <p className="text-gray-600">{PatientName || 'Someone'} is calling you...</p>
//         </div>

//         <div className="flex gap-4">
//           <Button 
//             onClick={handleAccept} 
//             variant="default"
//             className="flex-1 py-6 text-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300"          >
//             Accept
//           </Button>
//           <Button 
//             onClick={handelReject}
//             variant="destructive"
//             className="flex-1 py-6 text-lg bg-red-500 hover:bg-red-600 text-white transition-all duration-300"
//           >
//             Reject
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReceiveCall;