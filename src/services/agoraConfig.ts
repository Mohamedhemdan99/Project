
// Simple mock service for video call functionality
// This is a design-only implementation without actual Agora integration

// Format seconds into mm:ss format
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Mock participant data generation for design purposes
// export const getMockParticipants = (count: number = 4) => {
//   const names = ["You", "Alex Smith", "Taylor Jones", "Jordan Lee", "Casey Kim", "Riley Brown"];
  
//   return Array(count).fill(null).map((_, index) => ({
//     id: index.toString(),
//     name: index === 0 ? names[0] : names[(index % names.length)],
//     isSelf: index === 0,
//     isMuted: index === 0 ? true : Math.random() > 0.5,
//     isVideoOn: index === 0 ? false : Math.random() > 0.3,
//     isHost: index === 0,
//   }));
// };
