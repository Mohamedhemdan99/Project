import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSignalR } from "../hooks/useSignalR";
import { useNavigate } from "react-router-dom";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Bell, User } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/axiosService';
import { getTimeAgo } from '@/utils/dateUtils';
import { signalRService } from '@/services/signalRService';

interface Post {
  id: number;
  content: string;
  createdAt: Date;
  author: {
    authorId: string;
    fullName: string;
    pictureUrl: string;
    userName: string;
  };
  reactionsCount: number;
  isAccepted: boolean;
}

import { AppConfig } from '../../config';

const serverURL = AppConfig.baseUrl;


const Home = () => {
  const { isAuthenticated } = useAuth();
  const { hasUnreadNotifications,isConnected } = useSignalR();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedPosts = React.useMemo(() => {
    return [...posts].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
    });
  }, [posts, sortOrder]);

  useEffect(() => {
    let isMounted = true;
    console.log("Home Component mounted")
    console.log("IsAuthenticated: ",isAuthenticated)
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/api/post');
        // console.log(localStorage.getItem("userId"));
        if (response.status !== 200) throw new Error('Failed to fetch');
        if (isMounted) {
          setPosts(response.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          // SignalR now handled at app level
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load posts');
        toast.error('Failed to fetch posts');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
 
    return () => {
      console.log("end fetch posts");
      isMounted = false;
    };
  }, []);


  const handleAcceptPost = async (postId: number) => {
    try {
      const requestAcceptorId = localStorage.getItem('userId');
      if (!requestAcceptorId) throw new Error('User ID not found');
      const response = await api.post(`/api/Helper/${postId}/Accept-Post`, { requestAcceptorId });
      if (response.status !== 200) throw new Error('Accept failed');

      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, reactionsCount: post.reactionsCount + 1, isAccepted: true }
          : post
      ));
      toast.success('Post accepted');
    } catch (error) {
      console.error('Accept error:', error);
      toast.error('Failed to accept post', { icon: '😥' });
    }
  };

  const handleIgnorePost = async (postId: number) => {
    try{
      const requestAcceptorId = localStorage.getItem('userId');
      // console.log(requestAcceptorId)
      if (!requestAcceptorId) throw new Error('User ID not found');
      const response = await api.delete(`/api/Helper/Remove-Reaction/${postId}`, { data: { requestAcceptorId } });
      if (response.status !== 200) throw new Error('Ignore failed');
      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, reactionsCount: post.reactionsCount - (post.isAccepted ? 1 : 0), isAccepted: false }
          : post
      ));
      toast.info('Post ignored');
    } catch (error) {
      console.error('Ignore error:', error);
      toast.error('Failed to ignore post', { icon: '😥' });
    }
  };
// console.log(isConnected);
  const handleRetry = async () => {
    setError('');
    try {
      setIsLoading(true);
      const response = await api.get<Post[]>('/api/post');
      if (response.status !== 200) throw new Error('Failed to fetch');
      setPosts(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
      toast.error('Failed to fetch posts');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading posts...</div>;
  if (error)
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={handleRetry}>Retry Loading</Button>
      </div>
    );

  return (
    <div className="app-container bg-gray-50 min-h-screen pb-20 pt-16">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">Posts</h2>
            <div className="relative cursor-pointer" onClick={() => navigate('/notifications')}>
              <Bell className="h-6 w-6" />
              {hasUnreadNotifications && (
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500" />
              )}
            </div>
          </div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="px-4 py-2 border rounded-md"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
        <div className="space-y-6">
          {sortedPosts.map((post) => (
            <Card key={post.id} className={`p-6 shadow-sm`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={serverURL + post.author.pictureUrl} alt={post.author.fullName} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{post.author.fullName}</h3>
                    <p className="text-sm text-gray-500">@{post.author.userName} · {getTimeAgo(post.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-800">{post.content}</p>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500 flex items-center">
                  <span className="font-medium text-blue-500">{post.reactionsCount}</span>
                  <span className="ml-1">Acceptances</span>
                </div>

                {/* {post.author.authorId !== user?.userId && ( */}
                  <div className="flex gap-4">
                    <Button
                      className={`${post.isAccepted ? 'bg-green-600 hover:bg-green-700 text-white' : 'btn-primary'}`}
                      onClick={() => handleAcceptPost(post.id)}
                      disabled={post.isAccepted}
                    >
                      {post.isAccepted ? 'Accepted' : 'Accept'}
                    </Button>
                    <Button
                      variant="outline"
                      className="btn-outline"
                      onClick={() => handleIgnorePost(post.id)}
                    >
                      Ignore
                    </Button>
                  </div>
                {/* )} */}

                {post.isAccepted && (
                  <div>
                    <span className="text-green-600 font-medium">Accepted</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;