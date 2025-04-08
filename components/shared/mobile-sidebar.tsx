'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Clock5, Cloud, Loader, Plus, Star, Tablet, Trash } from 'lucide-react'
import Link from 'next/link'
import Item from './item'
import { Progress } from '../ui/progress'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import PopoverActions from './popover-actions'
import { usePlan } from '@/hooks/use-plan'
import { useSubscription } from '@/hooks/use-subscribtion'
import { byteConverter } from '@/lib/utils'
import axios from 'axios'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

const MobileSidebar = () => {
	const { onOpen } = usePlan()
	const { 
		subscription, 
		isLoading, 
		totalStorage, 
		setTotalStorage, 
		setIsLoading, 
		setSubscription 
	} = useSubscription()
	const [isOpen, setIsOpen] = useState(false)

	// Fetch storage info
	useEffect(() => {
		const fetchStorageInfo = async () => {
			try {
				setIsLoading(true)
				const response = await axios.get('/api/storage')
				
				setTotalStorage(response.data.storageUsed)
				if (response.data.subscription) {
					setSubscription(response.data.subscription)
				}
			} catch (error) {
				console.error('Failed to fetch storage info:', error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchStorageInfo()
	}, [setTotalStorage, setIsLoading, setSubscription])

	const totalValue = subscription === 'Basic' ? 1.5 * 1024 * 1024 * 1024 : 15 * 1024 * 1024 * 1024
	const storagePercentage = (totalStorage / totalValue) * 100

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<Button 
					variant="ghost" 
					size="icon" 
					className="fixed top-[5vh] left-4 z-50 md:hidden"
				>
					<Menu />
				</Button>
			</SheetTrigger>
			<SheetContent side="left" className="w-72">
				<div className='flex flex-col p-3 mt-8'>
					<Popover>
						<PopoverTrigger asChild>
							<Button className='w-fit h-12 rounded-full px-6'>
								<Plus />
								<span>New</span>
							</Button>
						</PopoverTrigger>
						<PopoverContent className='p-0 py-2'>
							<PopoverActions />
						</PopoverContent>
					</Popover>

					<div className='flex flex-col space-y-6 mt-8'>
						{sidebarLinks.map(link => (
							<Link 
								href={link.path} 
								key={link.path} 
								onClick={() => setIsOpen(false)}
							>
								<Item icon={link.icon} label={link.label} path={link.path} />
							</Link>
						))}

						<div className='flex flex-col space-y-2 mx-4'>
							{isLoading ? (
								<Loader className='mx-auto animate-spin' />
							) : (
								<>
									<Progress 
										className='h-2' 
										value={storagePercentage} 
									/>
									<span>
										{byteConverter(totalStorage, 1)} of{' '}
										{subscription === 'Basic' ? '1.5 GB' : '15 GB'} used
									</span>
								</>
							)}

							<Button
								className='rounded-full'
								variant={'outline'}
								onClick={() => {
									onOpen()
									setIsOpen(false)
								}}
							>
								Get more storage
							</Button>
						</div>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	)
}

export default MobileSidebar

const sidebarLinks = [
	{
		label: 'My drive',
		icon: Tablet,
		path: '/',
	},
	{
		label: 'Starred',
		icon: Star,
		path: '/starred',
	},
	{
		label: 'Recent',
		icon: Clock5,
		path: '/recent',
	},
	{
		label: 'Trash',
		icon: Trash,
		path: '/trash',
	},
	{
		label: 'Storage',
		icon: Cloud,
		path: '/cloud',
	},
]