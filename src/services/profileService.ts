
import { toast } from "sonner";
import axios from "axios";
import api  from "./axiosService";
// import { EditableUserProfile, UserProfile } from "./authService";

// const API_URL = "https://bewtihme-001-site1.jtempurl.com/api/profile";
// const API_URL = "https://localhost:1190";
export interface ProfileData {
  userId: string;
  userName: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  email: string;
  languagePreference: string;
  rate: number;
  profileImageUrl: string;
}

// For profile updates with optional file uploads
export interface EditableUserProfile extends Partial<Omit<ProfileData, 'profileImageUrl'>> {
  fullName?: string;
  gender?: string;
  dateOfBirth?: string;
  profileImageUrl?: File | string | null;
  password?: string;
  languagePreference?: string;

}
export interface ProfileUpdateData {
  fullName?: string;
  gender?: string;
  dateOfBirth?: string | Date;
  languagePreference?: string;
  profileImage?: File | null;
  password?: string;
  confirmPassword?: string;
}









export const profileService = {
  // Get profile data
  async getProfileData(): Promise<ProfileData> {
    try {
      const response = await api.get('/api/Profile',);
      
      // console.log("ProfileService.jsx: getProfileData", response.data);
  
      // Validate the response data
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid profile data received from the server');
      }
  
      // Check required fields
      if (!response.data.fullName || !response.data.email) {
        throw new Error('Profile data is incomplete');
      }
  
      // Store the profile image URL in localStorage if available
      if (response.data.profileImageUrl) {
        localStorage.setItem('profileImageUrl', JSON.stringify(response.data.profileImageUrl));
      }
  
      // Store the full user data in localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
      // console.log(JSON.parse(localStorage.getItem('user')))
  
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Failed to fetch profile data';
        toast.error(message);
      }
      throw error;
    }
  },

// get user from local storage
  getCurrentUser(): ProfileData | null {
    const userDataString = localStorage.getItem('user');
    // console.log("ProfileService.jsx: getCurrentUser",userDataString);
    if (!userDataString || userDataString === 'undefined') {
      console.error('User data not found in local storage');
      localStorage.removeItem('user');
      return null;
    }
    
    try {
      // Validate JSON structure before parsing
      if (!/^\s*\{.*\}\s*$/.test(userDataString)) {
        throw new Error('Invalid JSON format');
      }
      
      const userData = JSON.parse(userDataString);
      console.log("ProfileService.jsx: getCurrentUser",userData);
      // Basic validation of required fields
      // if (!userData?.username || !userData?.email) {
      //   throw new Error('Invalid user data structure');
      // }
      
      return userData;
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      return null;
    }
  },


//   async updateProfile(userData: EditableUserProfile) {
//   try {
//     const data = new FormData();
    
//     // Append all user data that's being updated
//     Object.entries(userData).forEach(([key, value]) => {
//       if (key === 'profileImageUrl' && value instanceof File) {
//         data.append('profileImageUrl', value);
//       } else if (value !== null && value !== undefined) {
//         data.append(key, String(value));
//       }
//     });

//     console.log("ProfileService.jsx: data before updating", data);
    
//     const response = await api.put('/api/Profile', data, {
//       headers: { 'Content-Type': 'multipart/form-data' }
//     });
    
//     // Return the complete updated profile data
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const message = error.response?.data?.message || 'Profile update failed';
//       toast.error(message);
//     }
//     throw error;
//   }
// },

async updateUserProfile(profileData: ProfileUpdateData) {
  try {
    // Create a FormData object to handle file uploads
    const formData = new FormData();
    
    // Add text fields to FormData if they exist
    if (profileData.fullName) {
      formData.append('fullName', profileData.fullName);
    }
    
    if (profileData.gender) {
      formData.append('gender', profileData.gender);
    }
    
    // Handle date of birth formatting
    if (profileData.dateOfBirth) {
      // If it's a Date object, format it to ISO string (backend will handle conversion)
      if (profileData.dateOfBirth instanceof Date) {
        formData.append('dateOfBirth', profileData.dateOfBirth.toISOString());
      } else {
        // If it's already a string (from input type="date"), pass it as is
        formData.append('dateOfBirth', profileData.dateOfBirth);
      }
    }
    
    if (profileData.languagePreference) {
      formData.append('languagePreference', profileData.languagePreference);
    }
    
    // Add profile image if provided
    if (profileData.profileImage) {
      formData.append('profileImage', profileData.profileImage);
    }
    if (profileData.password) {
      formData.append('password', profileData.password);
    }
    if (profileData.confirmPassword) {
      formData.append('confirmPassword', profileData.confirmPassword);
    }
    
    // Make the API call with the correct content type for FormData
    const response = await api.put('/api/Profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    
    
    // Update local storage with new user data if needed
    if (response.data) {
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...response.data };
        console.log("ProfileService.jsx: currentUser", currentUser);
        console.log("ProfileService.jsx: updatedUser", updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      toast.error(errorMessage,{icon:'❌'});
    } else {
      toast.error('An unexpected error occurred');
    }
    throw error;
  }
}
};
      
