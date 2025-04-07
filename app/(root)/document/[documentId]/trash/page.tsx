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
import { db } from '@/lib/firebase'
import { DocIdProps } from '@/types'
import { getServerSession } from 'next-auth/next'
import { collection, getDocs, query, where } from 'firebase/firestore'
import React from 'react'
import { authOptions } from '@/auth.config'

const getFiles = async (folderId: string, uid: string) => {
	let files: any[] = []
	const q = query(
		collection(db, 'folders', folderId, 'files'),
		where('uid', '==', uid),
		where('isArchive', '==', true)
	)
	const querySnapshot = await getDocs(q)
	querySnapshot.forEach(doc => {
		files.push({ ...doc.data(), id: doc.id })
	})

	return files
}

const DocumentTrashPage = async ({ params }: DocIdProps) => {
	const session = await getServerSession(authOptions)
	const userId = session?.user?.id
	
	// Make sure we have a userId before fetching data
	if (!userId) {
		return <div>Please sign in to access the trash</div>
	}
	
	const files = await getFiles(params.documentId, userId)

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