import SuggestCard from '@/components/card/suggest-card'
import Empty from '@/components/shared/empty'
import Header from '@/components/shared/header'
import { DocIdProps } from '@/types'
import { getServerSession } from 'next-auth/next'
import React from 'react'
import { authOptions } from '@/auth.config'
import { prisma } from '@/lib/prisma'

const DocumentStarredPage = async ({ params }: DocIdProps) => {
	const session = await getServerSession(authOptions)
	const userId = session?.user?.id
	
	// Make sure we have a userId before fetching data
	if (!userId) {
		return <div>Please sign in to access your starred items</div>
	}
	
	// Get starred files in the folder
	const files = await prisma.file.findMany({
		where: {
			folderId: params.documentId,
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
			<Header label='Starred' isDocumentPage isHome={false} />
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

export default DocumentStarredPage