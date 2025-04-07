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
import { db } from '@/lib/firebase'
import { getServerSession } from 'next-auth/next'
import { collection, getDocs, query, where } from 'firebase/firestore'
import React from 'react'
import { authOptions } from '@/auth.config'

const getData = async (uid: string) => {
	let data: any[] = []
	const q = query(
		collection(db, 'files'),
		where('uid', '==', uid),
		where('isArchive', '==', false)
	)
	const querySnapshot = await getDocs(q)
	querySnapshot.forEach(doc => {
		data.push({ ...doc.data(), id: doc.id })
	})

	return data
}

const CloudPage = async () => {
	const session = await getServerSession(authOptions)
	const userId = session?.user?.id
	
	// Make sure we have a userId before fetching data
	if (!userId) {
		return <div>Please sign in to access your storage</div>
	}
	
	const files = await getData(userId)

	const totalSize = files.reduce((acc, file) => acc + file.size, 0)

	return (
		<>
			<Header label='Storage' />
			<Storage totalSize={JSON.parse(JSON.stringify(totalSize))} />

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
					{files.map(folder => (
						<ListItem
							key={folder.id}
							item={JSON.parse(JSON.stringify(folder))}
						/>
					))}
				</TableBody>
			</Table>
		</>
	)
}

export default CloudPage