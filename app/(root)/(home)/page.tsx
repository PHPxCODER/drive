import Header from '@/components/shared/header'
import Lists from '@/components/shared/lists'
import { getServerSession } from 'next-auth/next'
import React from 'react'
import { authOptions } from '@/auth.config'
import { prisma } from '@/lib/prisma'

const HomePage = async () => {
	const session = await getServerSession(authOptions)
	const userId = session?.user?.id
	
	// Make sure we have a userId before fetching data
	if (!userId) {
		return <div>Please sign in to access your drive</div>
	}
	
	// Get folders from database
	const folders = await prisma.folder.findMany({
		where: {
			userId,
			isArchive: false,
			isDocument: false
		},
		orderBy: {
			createdAt: 'desc'
		}
	})
	
	// Get files from database
	const files = await prisma.file.findMany({
		where: {
			userId,
			isArchive: false,
			isDocument: false
		},
		orderBy: {
			createdAt: 'desc'
		}
	})

	return (
		<>
			<Header label={'My drive'} isHome />
			<Lists
				folders={JSON.parse(JSON.stringify(folders))}
				files={JSON.parse(JSON.stringify(files))}
			/>
		</>
	)
}

export default HomePage