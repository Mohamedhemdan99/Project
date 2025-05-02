
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import historyService, { CallHistory } from '../services/historyService';
import { toast } from 'sonner';

import { AppConfig } from '../../config';

const serverURL = AppConfig.baseUrl;

const History = () => {
const [History, setHistory] = useState<CallHistory[]>([]);
const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    historyService.getHistory().then(data => {
      console.log(data);
      if (data) {
        setHistory(data);
        setIsLoading(false);
      }
      else {
        setIsLoading(false);
      }
    }).catch(error => {
      console.error('Error fetching call history:', error);
      toast.error('Failed to fetch call history', { icon: "❌" });
    });
  }, []);


  return (
    <div className="app-container min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Activity History</h1>
        
        <div className="space-y-4">
          {History.map((item) => (
            <Card key={item.id} className="p-4 border-l-4 border-l-brand-blue">
              <div className="flex items-start">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={serverURL + item.caller.pictureUrl} alt={item.caller.fullName} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      {/* caller info */}
                        <h3 className="font-semibold text-gray-900">{item.caller.fullName} {/* add space between name and start time */}

                         <span className="text-sm text-gray-500">{new Date(item.startTime).toLocaleString()}</span>
                      </h3>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">@{item.caller.username}</span> 
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="text-gray-900">Duration:</span> {item.duration?.toFixed(1) || "-"} minutes
                      </p>
                    </div>
                    
                    <div 
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        item.status === 'Connected' ? 'bg-green-100 text-green-800' :
                        item.status === 'Initiated' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.status}
                    </div>
                  </div>
                  
                  {/* {item.status !== 'Initiated' && (
                    <div className="mt-4 flex gap-3">
                      <Button variant="outline" size="sm" className="text-sm">
                        View Details
                      </Button>
                      
                      <Button variant="outline" size="sm" className="text-sm text-brand-blue border-brand-blue">
                        Message
                      </Button>
                    </div>
                  )} */}
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {/* <div className="mt-8 flex justify-center">
          <Button variant="outline" className="text-gray-500">
            Load More
          </Button>
        </div> */}
      </div>
    </div>
  );
};

export default History;
