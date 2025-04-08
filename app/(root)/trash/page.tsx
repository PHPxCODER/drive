import Empty from '@/components/shared/empty'
import Header from '@/components/shared/header'
import TrashItem from '@/components/shared/trash-item'
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

const TrashPage = async () => {
	const session = await getServerSession(authOptions)
	const userId = session?.user?.id
	
	// Make sure we have a userId before fetching data
	if (!userId) {
		return <div>Please sign in to access your trash</div>
	}
	
	// Get archived folders
	const folders = await prisma.folder.findMany({
		where: {
			userId,
			isArchive: true
		},
		orderBy: {
			archivedAt: 'desc'
		}
	})
	
	// Get archived files
	const files = await prisma.file.findMany({
		where: {
			userId,
			isArchive: true
		},
		orderBy: {
			archivedAt: 'desc'
		}
	})

	return (
		<>
			<Header label='Trash' />
			{[...files, ...folders].length === 0 ? (
				<Empty />
			) : (
				<Table className='mt-4'>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Archived time</TableHead>
							<TableHead>File size</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{[...folders, ...files].map(item => (
							<TrashItem
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

export default TrashPage