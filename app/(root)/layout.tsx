'use client';

import Navbar from '@/components/shared/navbar'
import Sidebar from '@/components/shared/sidebar'
import MobileSidebar from '@/components/shared/mobile-sidebar'
import React, { useState, useEffect } from 'react'

const RootLayout = ({ children }: { children: React.ReactNode }) => {
	const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('desktop')

	useEffect(() => {
		const checkDeviceType = () => {
			setDeviceType(window.innerWidth < 768 ? 'mobile' : 'desktop')
		}

		checkDeviceType()
		window.addEventListener('resize', checkDeviceType)

		return () => {
			window.removeEventListener('resize', checkDeviceType)
		}
	}, [])

	return (
		<div>
			<Navbar />
			{deviceType === 'desktop' ? <Sidebar /> : <MobileSidebar />}
			<main 
				className={`w-full min-h-[90vh] relative top-[10vh] ${
					deviceType === 'desktop' ? 'pl-72' : 'pl-0'
				} bg-[#F6F9FC] dark:bg-[#1f1f1f] pr-4`}
			>
				<div className='min-h-[90vh] rounded-xl bg-white dark:bg-black p-4'>
					{children}
				</div>
			</main>
		</div>
	)
}

export default RootLayout