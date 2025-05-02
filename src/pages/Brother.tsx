
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { signalRService } from '../services/signalRService';
import { toast } from 'sonner';
import { brotherService, CallHistoryDto } from '../services/BrotherService';
// Mock data for people
import { AppConfig } from '../../config';

const serverURL = AppConfig.baseUrl;



const Brother = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [Brother, setBrother] = useState<CallHistoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
   setIsLoading(true);
   console.log("Fetching call history...");
   console.log("userid",localStorage.getItem('userId'));
    brotherService.getCallHistory().then(data => {
      if (data) {
        setBrother(data);
        setIsLoading(false);
      }
      else {
        setIsLoading(false);
      }
    }).catch(error => {
      console.error('Error fetching call history:', error);
      toast.error('Failed to fetch call history',{icon: '⚠️'});
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <div className="text-center py-8">Loading call history...</div>;

  // Get unique callers by filtering based on caller ID
  const uniqueCallers = Brother.reduce((acc, current) => {
    const isDuplicate = acc.find(item => item.caller.id === current.caller.id);
    if (!isDuplicate) {
      return [...acc, current];
    }
    return acc;
  }, [] as CallHistoryDto[]);

  const filteredPeople = uniqueCallers.filter(person => 
    person.caller.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container bg-gray-50 min-h-screen pb-20 pt-16">
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">People</h1>
          <div className="relative max-w-xl">
            <Input
              type="text"
              placeholder="Search for people..."
              className="pl-10 pr-4 py-3"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              width="20" 
              height="20" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPeople.map((person) => (
            <Card key={person.id} className="p-6 flex flex-col items-center hover:shadow-md transition-shadow">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={serverURL + person.caller.pictureUrl} alt={person.caller.fullName} />
                <AvatarFallback>
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              
              <h3 className="text-xl font-semibold text-center mb-2">{person.caller.fullName}</h3>
              
              <div 
                className={`px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                  person.caller.status === true ? 'bg-green-100 text-green-800' :
                  person.caller.status === false ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}
              >
                <span 
                  className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    person.caller.status === true ? 'bg-green-500' :
                    person.caller.status === false ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`}
                ></span>
                {person.caller.status === true ? 'Active' : 
                 person.caller.status === false ? 'Away' : 'Offline'}
              </div>
              
              {/* <div className="mt-auto w-full">
                <Button 
                  className="w-full btn-primary"
                  onClick={() => handleConnect(person.id)}
                >
                  Connect
                </Button>
              </div> */}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Brother;

