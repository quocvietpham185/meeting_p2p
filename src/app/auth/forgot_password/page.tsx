import { Metadata } from 'next';
import ForgotPasswordPage from './ForgetPassword';

export const metadata: Metadata = {
  title: 'Sign Up - VideoMeet',
  description: 'Sign in to VideoMeet for crystal clear video conferencing. Access your account to join seamless video meetings with professional quality and secure authentication.',
  keywords: 'sign in, login, video conferencing, VideoMeet, video meetings, secure authentication, team collaboration',
  
  openGraph: {
    title: 'Sign Up - VideoMeet',
    description: 'Sign in to VideoMeet for crystal clear video conferencing. Access your account to join seamless video meetings with professional quality and secure authentication.',
  }
}

export default function Page() {
  return <ForgotPasswordPage />
}