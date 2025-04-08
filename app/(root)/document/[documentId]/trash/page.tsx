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
import { DocIdProps } from '@/types'
import { getServerSession } from 'next-auth/next'
import React from 'react'
import { authOptions } from '@/auth.config'
import { prisma } from '@/lib/prisma'

const DocumentTrashPage = async ({ params }: DocIdProps) => {
	const session = await getServerSession(authOptions)
	const userId = session?.user?.id
	
	// Make sure we have a userId before fetching data
	if (!userId) {
		return <div>Please sign in to access the trash</div>
	}
	
	// Get archived files in the folder
	const files = await prisma.file.findMany({
		where: {
			folderId: params.documentId,
			userId,
			isArchive: true
		},
		orderBy: {
			archivedAt: 'desc'
		}
	})

	return (
		<>
			<Header label='Trash' isDocumentPage isHome={false} />
			{files.length === 0 ? (
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
						{files.map(folder => (
							<TrashItem
								key={folder.id}
								item={JSON.parse(JSON.stringify(folder))}
							/>
						))}
					</TableBody>
				</Table>
			)}
		</>
	)
}

export default DocumentTrashPage