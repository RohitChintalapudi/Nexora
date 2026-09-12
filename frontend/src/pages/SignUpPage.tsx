import React from 'react';
import { AuthPage } from './AuthPage';

interface SignUpPageProps {
  onNavigateHome?: () => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigateHome }) => {
  return <AuthPage initialMode="signup" onNavigateHome={onNavigateHome} />;
};

export default SignUpPage;
