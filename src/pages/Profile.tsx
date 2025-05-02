import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { profileService, ProfileData, EditableUserProfile, ProfileUpdateData } from '../services/profileService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, EyeOff, Edit, User, Calendar, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { SelectValue } from '@/components/ui/select copy';
import { AppConfig } from '../../config';

const Profile = () => {
  const { logout, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editableUser, setEditableUser] = useState<EditableUserProfile>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<ProfileUpdateData>({
    fullName: '',
    gender: '',
    dateOfBirth: '',
    languagePreference: '',
    profileImage: null,
    password: '',
    confirmPassword: ''
  });

  const serverURL = AppConfig.baseUrl;

  // Fetch profile data from the backend
  useEffect(() => {
    let isMounted = true;
console.log(user);
    const initializeUserData = async () => {
      try {
        setLoading(true);
        const [profileData, currentUser] = await Promise.all([
          profileService.getProfileData(),
          profileService.getCurrentUser()
        ]);
        console.log('Fetched profile data:', profileData);
        console.log('Current user:', currentUser);
        if (isMounted) {
          setProfileData(profileData);
          // Initialize image preview from profile data
          if (profileData?.profileImageUrl) {
            setImagePreview(profileData.profileImageUrl);
          }
        }
      } catch (error) {
        console.error('Error initializing user data:', error);
        if (isMounted) {
          toast.error('Failed to load user data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (user) {
      initializeUserData();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user]); // Add user as a dependency

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  // Return early if user is not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  // // Handle input changes for editable fields
  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target;
  //   setEditableUser((prev) => ({ ...prev, [name]: value }));
  // };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, profileImage: file }));
      
      // Create preview if needed
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  // Handle image upload
  // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files[0]) {
  //     const file = e.target.files[0];
  //     setEditableUser((prev) => ({ ...prev, profileImageUrl: file }));

  //     // Create a temporary preview of the uploaded image
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       // Show preview while in edit mode
  //       setImagePreview(reader.result as string);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };
// Handle form submission
const handleSaveProfile = async () => {
  if (formData.password && formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match', { icon: '❌',position:'bottom-center' });
        return;
      }
  try {
    // Show loading indicator
    toast.loading('Updating profile...');
    
    // Call the service function with the form data
    await profileService.updateUserProfile(formData);
    
    // Refresh profile data after update
    const refreshedData = await profileService.getProfileData();
    setProfileData(refreshedData);
    
    // Update local storage and dispatch event to notify navbar
    localStorage.setItem('user', JSON.stringify(refreshedData));
    window.dispatchEvent(new Event('userProfileUpdated'));
    
    // Reset form state
    setIsEditing(false);
    setImagePreview(null);
    
    
    // Show success message
    toast.dismiss();
    toast.success('Profile updated successfully', { icon: '✅' });
  } catch (error) {
    toast.dismiss();
    // console.error('Error updating profile:', error);
    toast.error('Failed to update profile', { icon: '❌' });
  }
};
  // Handle saving updated profile data
  // const handleSave = async () => {
  //   if (newPassword && newPassword !== confirmPassword) {
  //     toast.error('Passwords do not match');
  //     return;
  //   }

  //   try {
  //     const dataToUpdate: EditableUserProfile = { ...editableUser };
  //     if (newPassword) {
  //       dataToUpdate.password = newPassword;
  //     }

  //     const updatedProfile = await profileService.updateProfile(dataToUpdate);
  //     const refreshedData = await profileService.getProfileData();
  //     setProfileData(refreshedData);
      
  //     // Clear the temporary base64 preview and use the actual URL from server
  //     setImagePreview(null); // Clear the temporary preview
  //     if (refreshedData?.profileImageUrl) {
  //       // Use the actual URL from the server
  //       setImagePreview(refreshedData.profileImageUrl);
  //     }

  //     setIsEditing(false);
  //     setNewPassword('');
  //     setConfirmPassword('');
  //     toast.success('Profile updated successfully', { icon: '✅' });
  //   } catch (error) {
  //     console.error('Error updating profile:', error);
  //     toast.error('Failed to update profile');
  //   }
  // };

  // Fallback to user data if profileData is not available
  const displayName = profileData?.fullName || user?.fullName || '';
  const displayEmail = profileData?.email || user?.email || '';
  const displayGender = profileData?.gender || user?.gender || '';
  const displayDateOfBirth = profileData?.dateOfBirth || user?.dateOfBirth || '';
  const displayRating = profileData?.rate || 0;
  const displayPicture = profileData?.profileImageUrl || user?.profileImageUrl || '';
console.log('Display Picture:', displayPicture);
console.log('Image Preview:', imagePreview);
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="app-container min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto max-w-4xl px-4 py-10">
        <Card className="overflow-hidden shadow-xl rounded-xl">
          {/* Profile Header/Cover */}
          <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 h-48 w-full relative">
            <div className="absolute inset-0 bg-black opacity-10"></div>
          </div>
          <div className="px-6 sm:px-8 relative">
            {/* Profile Picture */}
            <div className="relative -mt-20 mb-6">
              <div className="relative inline-block">
                <Avatar className="h-40 w-40 border-4 border-white shadow-2xl ring-4 ring-blue-50">
                  <AvatarImage src={imagePreview && imagePreview.startsWith('data:image/jpeg;base64') ? imagePreview : serverURL+displayPicture} alt={displayName} className="object-cover" />
                  <AvatarFallback>
                    <User className="h-20 w-20 text-gray-400" />
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label className="absolute bottom-2 right-2 bg-blue-600 text-white p-3 rounded-full cursor-pointer hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                    <Edit className="h-5 w-5" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <CardHeader className="px-0">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-2">
                    <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                      {displayName}
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-lg">@{user?.userName || 'N/A'}</CardDescription>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                        <Calendar className="h-4 w-4 mr-1" />
                        Joined {format(new Date(), 'MMMM yyyy')}
                      </span>
                      {displayRating > 0 && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 font-medium">
                          ★ {displayRating.toFixed(1)} Rating
                        </span>
                      )}
                    </div>
                  </div>
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="flex items-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all duration-200 px-6 py-2 rounded-full"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setEditableUser({});
                          setImagePreview(null);
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                        className="text-gray-600 hover:bg-gray-50 transition-all duration-200 px-6 py-2 rounded-full"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveProfile}
                        className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 px-6 py-2 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-0 py-6">
                <div className="space-y-8">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-6">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700">Full Name</Label>
                        {isEditing ? (
                          <Input
                            name="fullName"
                            value={formData.fullName || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                            placeholder="Enter your full name"
                          />
                        ) : (
                          <p className="text-lg font-medium text-gray-900">{displayName}</p>
                        )}
                      </div>
                      <div className="space-y-3">
                        <Label className="text-md font-semibold text-gray-700">Email</Label>
                        <p className="text-lg font-medium text-gray-900">{displayEmail}</p>
                      </div>
                      {/* <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700">Username</Label>
                        <p className="text-lg font-medium text-gray-900">@{user?.userName || 'N/A'}</p>
                      </div> */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700">Gender</Label>
                        {isEditing ? (
                          <Select
                            value={formData.gender}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                          >
                            <SelectTrigger className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
                              <SelectValue placeholder="Select your gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male" className="py-2 px-4 hover:bg-blue-50">Male</SelectItem>
                              <SelectItem value="female" className="py-2 px-4 hover:bg-blue-50">Female</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-lg font-medium text-gray-900 capitalize">{displayGender}</p>
                        )}
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xl font-semibold text-gray-700">Date of Birth</Label>
                        {isEditing ? (
                          <Input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-900 focus:ring-blue-500"
                        />
                        ) : (
                          <p className="text-lg border-3 border-gray-300 focus:ring-blue-500 font-medium text-gray-900">
                            {displayDateOfBirth ? format(new Date(displayDateOfBirth), 'PPP') : 'Not provided'}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-700">Rating</Label>
                        <div className="flex items-center">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-5 h-5 ${star <= displayRating ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="ml-2 font-semibold">{displayRating}/5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Password Section (only in edit mode) */}
                  {isEditing && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Update Password</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password || ''}
                            onChange={handleInputChange}
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            className="absolute right-3 bottom-3 text-gray-500"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <div className="relative">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirmPassword || ''}
                            onChange={handleInputChange}
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            className="absolute right-3 bottom-3 text-gray-500"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="px-0 pt-4 flex justify-end">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </CardFooter>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;