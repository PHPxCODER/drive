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
  title: 'Recents | RDP Cloud',
  description: 'Your personal cloud storage and file management system',
  icons: {
    icon: '/drive.svg',
  },
}

const RecentPage = async () => {
	const session = await getServerSession(authOptions)
	const userId = session?.user?.id
	
	// Make sure we have a userId before fetching data
	if (!userId) {
		return <div>Please sign in to access your recent items</div>
	}
	
	// Get recent folders
	const folders = await prisma.folder.findMany({
		where: {
			userId,
			isArchive: false
		},
		orderBy: {
			createdAt: 'desc'
		},
		take: 4
	})
	
	// Get recent files
	const files = await prisma.file.findMany({
		where: {
			userId,
			isArchive: false
		},
		orderBy: {
			createdAt: 'desc'
		},
		take: 4
	})

	return (
		<>
			<Header label='Recent' />
			{[...files, ...folders].length === 0 ? (
				<Empty />
			) : (
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
						{[...folders, ...files].map(item => (
							<ListItem
								key={item.id}
								item={JSON.parse(JSON.stringify(item))}
							/>
						))}
					</TableBody>
				</Table>
			)}
		</>
	)
}

export default RecentPage