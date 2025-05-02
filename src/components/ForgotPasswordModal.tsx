
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, X } from "lucide-react";
import { toast } from "sonner";
import { authService } from '@/services/authService';
import axios from 'axios';

enum ForgotPasswordStep {
  EMAIL_REQUEST,
  VERIFICATION_CODE,
  NEW_PASSWORD
}

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<ForgotPasswordStep>(ForgotPasswordStep.EMAIL_REQUEST);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [resetToken, setResetToken] = useState('');
  
  const handleClose = () => {
    onClose();
    // Reset the form after closing
    setTimeout(() => {
      setStep(ForgotPasswordStep.EMAIL_REQUEST);
      setEmail('');
      setVerificationCode(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
      setEmailError('');
    }, 300);
  };
  

  const handleSendCode = async () => {
    if (!email) {
      setEmailError('Please enter your email address');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    try {
      await authService.sendCode(email);
      toast.success('code sent to your email');
      setStep(ForgotPasswordStep.VERIFICATION_CODE);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Failed to send verification code';
        toast.error(message);
      }
      throw error;
    }
  };

  const handleVerifyCode = async () => {
    const code = verificationCode.join('');
    if (code.length !== 6) {
      toast.error('Please enter the complete verification code');
      return;
    }
    
    try {
      const response = await authService.verifyResetCode(email, code);
        if(response){
          console.log("Response: ",response);
          setResetToken(response);
        }
      toast.success('Code verified successfully');
      setStep(ForgotPasswordStep.NEW_PASSWORD);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Failed to verify verification code';
        toast.error(message);
      }
      throw error;
    }
  };
  
  const handleResetPassword = async () => {
    if (!newPassword) {
      toast.error('Please enter a new password');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    try {
      const response = await authService.resetPassword(email, resetToken, newPassword, confirmPassword);
      if(response){
        toast.success('Password reset successfully');
        handleClose();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Failed to reset password';
        toast.error(message);
      }
      throw error;
    }
  };
  
  const handleCodeChange = (index: number, value: string) => {
    // Only allow one character per input
    if (value.length > 1) {
      value = value.charAt(0);
    }
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };
  
  const handleResendCode = () => {
    toast.info('New verification code sent');
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <div className="absolute right-4 top-4">
          <button
            onClick={handleClose}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {step === ForgotPasswordStep.EMAIL_REQUEST && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-xl">Forgot Password?</DialogTitle>
              <DialogDescription className="text-center">
                No worries, we got you.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-6">
              <img 
                src="/lovable-uploads/8dda62a0-0775-4011-9499-0346362168c6.png" 
                alt="Forgot Password" 
                className="h-40"
              />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  className={emailError ? "border-red-500" : ""}
                />
                {emailError && (
                  <p className="text-red-500 text-sm">{emailError}</p>
                )}
              </div>
              <Button 
                className="w-full btn-primary" 
                onClick={handleSendCode}
              >
                Send Code
              </Button>
            </div>
          </>
        )}
        
        {step === ForgotPasswordStep.VERIFICATION_CODE && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-xl">Verification</DialogTitle>
              <DialogDescription className="text-center">
                Enter the code to continue.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-6">
              <img 
                src="/lovable-uploads/52a5f0ea-b476-4edd-934d-56e597634c0a.png" 
                alt="Verification" 
                className="h-40"
              />
            </div>
            
            <p className="text-center text-sm mb-2">
              We sent a code to<br />
              <span className="font-medium">{email}</span>
            </p>
            
            <div className="flex justify-center gap-2 my-6">
              {verificationCode.map((digit, index) => (
                <Input
                  key={index}
                  id={`code-${index}`}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  className="h-12 w-12 text-center text-xl"
                  maxLength={1}
                  autoFocus={index === 0}
                />
              ))}
            </div>
            
            <Button 
              className="w-full btn-primary" 
              onClick={handleVerifyCode}
            >
              Continue
            </Button>
            
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">
                Didn't receive the code? {' '}
                <button 
                  className="text-blue-500 hover:underline" 
                  onClick={handleResendCode}
                >
                  Send Again
                </button>
              </p>
            </div>
          </>
        )}
        
        {step === ForgotPasswordStep.NEW_PASSWORD && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-xl">Set New Password</DialogTitle>
              <DialogDescription className="text-center">
                Create a password.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-6">
              <img 
                src="/lovable-uploads/4ae0a1c4-2b23-42c8-97f8-46079ac76a97.png" 
                alt="Reset Password" 
                className="h-40"
              />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                  </button>
                </div>
              </div>
              <Button 
                className="w-full btn-primary" 
                onClick={handleResetPassword}
              >
                Reset Password
              </Button>
              <div className="text-center">
                <button 
                  className="text-sm text-blue-500 hover:underline" 
                  onClick={handleClose}
                >
                  Reset password later?
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal;
