import SuggestCard from '@/components/card/suggest-card'
import Empty from '@/components/shared/empty'
import Header from '@/components/shared/header'
import ListItem from '@/components/shared/list-item'
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { getServerSession } from 'next-auth/next'
import React from 'react'
import { authOptions } from '@/auth.config'
import { prisma } from '@/lib/prisma'
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Starred Items | RDP Cloud',
  description: 'Your personal cloud storage and file management system',
  icons: {
    icon: '/drive.svg',
  },
}

const StarredPage = async () => {
	const session = await getServerSession(authOptions)
	const userId = session?.user?.id
	
	// Make sure we have a userId before fetching data
	if (!userId) {
		return <div>Please sign in to access your starred items</div>
	}
	
	// Get starred folders
	const folders = await prisma.folder.findMany({
		where: {
			userId,
			isArchive: false,
			isStar: true
		},
		orderBy: {
			createdAt: 'desc'
		}
	})
	
	// Get starred files
	const files = await prisma.file.findMany({
		where: {
			userId,
			isArchive: false,
			isStar: true
		},
		orderBy: {
			createdAt: 'desc'
		}
	})

	return (
		<>
			<Header label='Starred' />
			{[...folders, ...files].length === 0 ? (
				<Empty />
			) : (
				<>
					<div className='text-sm opacity-70 mt-6'>Suggested</div>
					<div className='grid grid-cols-4 gap-4 mt-4'>
						{files.map(file => (
							<SuggestCard 
								item={JSON.parse(JSON.stringify(file))} 
								key={file.id} 
							/>
						))}
					</div>
					<div className='text-sm opacity-70 mt-6'>Folders</div>
					<Table className='mt-4'>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Owner</TableHead>
								<TableHead>Created at</TableHead>
								<TableHead>File size</TableHead>
								<TableHead className='text-right'>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{folders.map(folder => (
								<ListItem
									key={folder.id}
									item={JSON.parse(JSON.stringify(folder))}
								/>
							))}
						</TableBody>
					</Table>
				</>
			)}
		</>
	)
}

export default StarredPage