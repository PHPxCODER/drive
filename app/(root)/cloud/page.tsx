import Header from '@/components/shared/header'
import ListItem from '@/components/shared/list-item'
import Storage from '@/components/shared/storage'
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

const CloudPage = async () => {
	const session = await getServerSession(authOptions)
	const userId = session?.user?.id
	
	// Make sure we have a userId before fetching data
	if (!userId) {
		return <div>Please sign in to access your storage</div>
	}
	
	// Get files from database
	const files = await prisma.file.findMany({
		where: {
			userId,
			isArchive: false
		},
		orderBy: {
			createdAt: 'desc'
		}
	})

	// Calculate total size
	const totalSize = files.reduce((acc, file) => acc + (file.size || 0), 0)

	return (
		<>
			<Header label='Storage' />
			<Storage totalSize={totalSize} />

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
					{files.map(file => (
						<ListItem
							key={file.id}
							item={JSON.parse(JSON.stringify(file))}
						/>
					))}
				</TableBody>
			</Table>
		</>
	)
}

export default CloudPage