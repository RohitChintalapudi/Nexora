import React from 'react';
import { AuthPage } from './AuthPage';

interface SignInPageProps {
  onNavigateHome?: () => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onNavigateHome }) => {
  return <AuthPage initialMode="signin" onNavigateHome={onNavigateHome} />;
};

export default SignInPage;
