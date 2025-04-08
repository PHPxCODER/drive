import React from 'react'
import SignInPage from './SigninForm';
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Sign In | RDP Drive',
  description: 'Sign in to access your cloud storage and file management system',
  icons: {
    icon: '/drive.svg',
  },
}

function page() {
  return (
    <SignInPage/>
  )
}

export default page