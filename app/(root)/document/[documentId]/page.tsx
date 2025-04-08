import SuggestCard from '@/components/card/suggest-card'
import Empty from '@/components/shared/empty'
import Header from '@/components/shared/header'
import { DocIdProps, IFolderAndFile } from '@/types'
import React from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/auth.config'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

const DocumentIdPage = async ({ params }: DocIdProps) => {
	const session = await getServerSession(authOptions)
	const userId = session?.user?.id
	
	if (!userId) {
		return <div>Please sign in to access your documents</div>
	}
	
	// Get the folder
	const folder = await prisma.folder.findUnique({
		where: {
			id: params.documentId,
		}
	})
	
	if (!folder) {
		return notFound()
	}
	
	// Get files in the folder
	const files = await prisma.file.findMany({
		where: {
			folderId: params.documentId,
			userId,
			isArchive: false
		},
		orderBy: {
			createdAt: 'desc'
		}
	})

	return (
		<>
			<Header label={folder.name} isHome isDocument />
			{files.length === 0 ? (
				<Empty />
			) : (
				<div className='grid grid-cols-4 gap-4 mt-4'>
					{files.map(file => (
						<SuggestCard
							item={JSON.parse(JSON.stringify(file))}
							key={file.id}
						/>
					))}
				</div>
			)}
		</>
	)
}

export default DocumentIdPage