import { useState, useRef, useEffect } from "react";
import { FaVolumeUp, FaPlay, FaPause, FaStop } from "react-icons/fa";
import axios from "axios";

const Translation = () => {
  // States
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [finalVideoUrl, setFinalVideoUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("IDLE");
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [currentLanguage, setCurrentLanguage] = useState('en-US');
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // API Keys & URLs
  // const SYNC_API_KEY =process.env.REACT_APP_SYNC_API_KEY;
  const ELEVENLABS_API_KEY = "sk_e5d11a8fa447e997b36dd4d2fcfdf7c3b78e60defecadfd7";
//   const VIDEO_URL = "https://synchlabs-public.s3.us-west-2.amazonaws.com/david_demo_shortvid-03a10044-7741-4cfc-816a-5bccd392d1ee.mp4";
const VIDEO_URL = "https://bewtihme-001-site1.jtempurl.com/uploads/videos/ManFace.mp4"  
const AUDIO_UPLOAD_URL = "https://bewtihme-001-site1.jtempurl.com/api/Audio/upload";
const SYNC_API_URL = "https://api.sync.so/v2/generate";
const PROXY_URL = "https://bewtihme-001-site1.jtempurl.com/api/sync/generate";

  // Refs
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  // Voice Mapping for ElevenLabs
  const VOICE_MAP = {
    'en-US': 'LXrTqFIgiubkrMkwvOUr',
    'ar-SA': 'LXrTqFIgiubkrMkwvOUr'
  };

  // Logging system
  const addLog = (message, isError = false) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${isError ? 'ERROR: ' : ''}${message}`;
    setLogs(prev => [...prev, logEntry]);
    console.log(logEntry);
  };

  // Snackbar notification
  const showSnackBar = (message, isError = false) => {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 ${
      isError ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  // Toggle language
  const toggleLanguage = () => {
    const newLang = currentLanguage === 'en-US' ? 'ar-SA' : 'en-US';
    setCurrentLanguage(newLang);
    showSnackBar(
      newLang === 'en-US' 
        ? 'Language set to English' 
        : 'تم تغيير اللغة إلى العربية'
    );
    addLog(`Language changed to: ${newLang}`);
  };

  // Generate audio using ElevenLabs API
  const generateElevenLabsAudio = async (text, language) => {
    const voiceId = VOICE_MAP[language];
    try {
      addLog("Generating audio with ElevenLabs...");
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
          format: 'wav' // Ensure WAV format for compatibility
        },
        {
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json'
          },
          responseType: 'blob'
        }
      );
      addLog("Audio generated successfully.");
      return new Blob([response.data], { type: 'audio/wav' });
    } catch (error) {
      addLog("Failed to generate audio: " + error.message, true);
      throw error;
    }
  };

  // Upload audio to server
  const uploadToServer = async (audioBlob) => {
    if (!audioBlob || audioBlob.size < 1000) {
      throw new Error("Invalid audio blob");
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("File", audioBlob, `audio_${Date.now()}.wav`);
    try {
      addLog("Uploading audio...");
      const response = await axios.post(AUDIO_UPLOAD_URL, formData, {
        headers: {
          'Accept': '*/*',
        },
        withCredentials: true,
        timeout: 30000
      });
      const audioUrl = typeof response.data === 'string' ? response.data : response.data.url;
      setUploadedAudioUrl(audioUrl);
      addLog(`Audio uploaded: ${audioUrl}`);
      return audioUrl;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      addLog(`Upload failed: ${errorMsg}`, true);
      throw new Error(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  // Merge audio with video using Sync Labs
  const handleMergeAudioVideo = async (audioUrl) => {
    setIsProcessing(true);
    setStatus("PROCESSING");
    try {
      const payload = {
        model: "lipsync-1.7.1",
        input: [
          { url: VIDEO_URL, type: "video" },
          { url: audioUrl, type: "audio" }
        ],
        options: {
          sync_mode: "loop",
          output_format: "mp4",
          output_resolution: [1280, 720]
        }
      };
      addLog("Sending request to Sync Labs...");
      const response = await axios.post(PROXY_URL, payload, {
        headers: {
          "Content-Type": "application/json",
        //   "x-api-key": SYNC_API_KEY
        },
        timeout: 60000
      });
      addLog(`Sync request started: ${response.data.id}`);
      await checkStatus(response.data.id);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      addLog("Merge error: " + errorMsg, true);
      setError(errorMsg);
      setStatus("ERROR");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };



  // Check Sync Labs job status
  const checkStatus = async (id) => {
    const MAX_POLLING_TIME = 300000; // 5 minutes
    const startTime = Date.now();
    try {
      while (true) {
        if (Date.now() - startTime > MAX_POLLING_TIME) {
          throw new Error("Processing timed out");
        }
        // Use proxy URL instead of direct Sync.so URL
        const response = await axios.get(`${PROXY_URL}/${id}`, {
          headers: {
            "Content-Type": "application/json"
          }
        });
        const { status, outputUrl, error } = response.data;
        setStatus(status);
        if (status === "COMPLETED" && outputUrl) {
          setFinalVideoUrl(outputUrl);
          addLog("Video generation completed: " + outputUrl);
          break;
        } else if (status === "FAILED" || error) {
          throw new Error(error || "Video generation failed");
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      addLog("Status check error: " + errorMsg, true);
      setError(errorMsg);
      setStatus("ERROR");
      throw error;
    }
  };

  // Main handler
  const convertTextToAudio = async () => {
    if (!inputText.trim()) {
      showSnackBar(currentLanguage === 'en-US' ? 'Please enter text first' : 'الرجاء إدخال نص أولاً', true);
      return;
    }
    setLoading(true);
    setStatus("PROCESSING");
    setError(null);
    setFinalVideoUrl("");
    setUploadedAudioUrl(null);
    try {
      // Step 1: Generate Audio
      const audioBlob = await generateElevenLabsAudio(inputText, currentLanguage);

      // Step 2: Upload Audio
      const audioUrl = await uploadToServer(audioBlob);
      if (audioRef.current) audioRef.current.src = audioUrl;

      // Step 3: Generate Video
      await handleMergeAudioVideo(audioUrl);

      showSnackBar(currentLanguage === 'en-US' ? 'Video generated successfully!' : 'تم إنشاء الفيديو بنجاح!');
    } catch (error) {
      setError(error.message);
      setStatus("ERROR");
      showSnackBar(currentLanguage === 'en-US' ? `Error: ${error.message}` : `خطأ: ${error.message}`, true);
    } finally {
      setLoading(false);
      setStatus(status !== "ERROR" ? "COMPLETED" : "ERROR");
    }
  };


   // Show logs
  const showLogs = () => {
    const logWindow = window.open('', '_blank', 'width=800,height=600');
    logWindow.document.write(`
      <html>
        <head>
          <title>Application Logs</title>
          <style>
            body { font-family: monospace; padding: 20px; white-space: pre-wrap; }
            .error { color: red; }
            .info { color: black; }
          </style>
        </head>
        <body>
          <h2>Application Logs</h2>
          ${logs.map(log => `
            <div class="${log.includes('ERROR') ? 'error' : 'info'}">
              ${log}
            </div>
          `).join('')}
        </body>
      </html>
    `);
    logWindow.document.close();
  };


  // Playback controls
  const toggleAudioPlayback = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().then(() => setIsPlaying(true));
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleVideoPlayback = () => {
    if (!videoRef.current) return;
    videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
  };

  // Status color
  const getStatusColor = () => {
    switch (status) {
      case "PROCESSING": return "bg-blue-100 text-blue-800";
      case "COMPLETED": return "bg-green-100 text-green-800";
      case "ERROR": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      {/* Loading/Uploading Overlay */}
      {(loading || isUploading || isProcessing) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              <div>
                <h3 className="font-medium text-lg">
                  {currentLanguage === 'en-US' ? 'Processing' : 'جاري المعالجة'}
                </h3>
                <p className="text-gray-600">
                  {isUploading && (currentLanguage === 'en-US' 
                    ? 'Uploading audio...' 
                    : 'جاري رفع الصوت...')}
                  {isProcessing && (currentLanguage === 'en-US' 
                    ? 'Generating video...' 
                    : 'جاري إنشاء الفيديو...')}
                </p>
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full animate-pulse" 
                style={{ width: `${isUploading ? '40%' : isProcessing ? '80%' : '20%'}` }}
              ></div>
            </div>
          </div>
        </div>
      )}
      {/* Main App */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">
              {currentLanguage === 'en-US' ? 'VoiceSync Pro' : 'مزامنة الصوت'}
            </h1>
            <button
              onClick={toggleLanguage}
              className="px-3 py-1 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              {currentLanguage === 'en-US' ? 'العربية' : 'English'}
            </button>
          </div>
          {/* Main Content */}
          <div className="p-6">
            {/* Input Section */}
            <div className="mb-8">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                {currentLanguage === 'en-US' ? 'Enter your text' : 'أدخل النص الخاص بك'}
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  currentLanguage === 'en-US' 
                    ? 'Type or paste your text here...' 
                    : 'اكتب أو الصق النص هنا...'
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={5}
              />
            </div>
            {/* Controls */}
            <div className="flex flex-col space-y-4 mb-8">
              <button
                onClick={convertTextToAudio}
                disabled={loading || !inputText.trim()}
                className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors ${
                  loading || !inputText.trim()
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? (
                  <>
                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>
                      {currentLanguage === 'en-US' 
                        ? 'Processing...' 
                        : 'جاري المعالجة...'}
                    </span>
                  </>
                ) : (
                  <>
                    <FaVolumeUp />
                    <span>
                      {currentLanguage === 'en-US' 
                        ? 'Generate Video' 
                        : 'إنشاء فيديو'}
                    </span>
                  </>
                )}
              </button>
              {uploadedAudioUrl && (
                <button
                  onClick={toggleAudioPlayback}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center space-x-2"
                >
                  {isPlaying ? <FaPause /> : <FaPlay />}
                  <span>
                    {currentLanguage === 'en-US' 
                      ? (isPlaying ? 'Pause Audio' : 'Play Audio') 
                      : (isPlaying ? 'إيقاف الصوت' : 'تشغيل الصوت')}
                  </span>
                </button>
              )}
            </div>
            {/* Video Preview */}
            {finalVideoUrl ? (
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-700 mb-2">
                  {currentLanguage === 'en-US' ? 'Generated Video' : 'الفيديو الناتج'}
                </h2>
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    src={finalVideoUrl}
                    controls
                    className="w-full h-auto max-h-96"
                    onClick={toggleVideoPlayback}
                  />
                  <button
                    onClick={toggleVideoPlayback}
                    className="absolute inset-0 flex items-center justify-center w-full h-full opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <div className="bg-black bg-opacity-50 rounded-full p-4">
                      {videoRef.current && !videoRef.current.paused ? (
                        <FaPause className="text-white text-2xl" />
                      ) : (
                        <FaPlay className="text-white text-2xl" />
                      )}
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-8 bg-gray-100 rounded-lg p-8 text-center">
                <p className="text-gray-500">
                  {currentLanguage === 'en-US' 
                    ? 'Your generated video will appear here' 
                    : 'سيظهر الفيديو الناتج هنا'}
                </p>
              </div>
            )}
            {/* Status Panel */}
            <div className={`p-4 rounded-lg ${getStatusColor()} mb-4`}>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  status === "PROCESSING" ? "bg-blue-500 animate-pulse" :
                  status === "COMPLETED" ? "bg-green-500" :
                  status === "ERROR" ? "bg-red-500" : "bg-gray-500"
                }`}></div>
                <h3 className="font-medium">
                  {currentLanguage === 'en-US' ? 'Status:' : 'الحالة:'} {status}
                </h3>
              </div>
              {error && (
                <div className="mt-2 text-sm">
                  <p className="font-medium">
                    {currentLanguage === 'en-US' ? 'Error:' : 'خطأ:'}
                  </p>
                  <p>{error}</p>
                </div>
              )}
            </div>
            {/* Logs Button */}
            <button
              onClick={showLogs}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {currentLanguage === 'en-US' ? 'Show Logs' : 'عرض السجلات'}
            </button>
          </div>
        </div>
      </div>
      {/* Hidden Audio Element */}
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
    </div>
  );
};

export default Translation;
