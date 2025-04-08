import React from 'react'
import SettingsPage from './SettingsPage';
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Manage Your Account | RDP Cloud',
  description: 'Your personal cloud storage and file management system',
  icons: {
    icon: '/drive.svg',
  },
}

function page() {
  return (
	<SettingsPage/>
  )
}

export default page