import {useState, useEffect} from 'react'
import { createGroup } from '@/api/index'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { isGroupNameUnique } from '@/api/index'
import { toast } from 'react-toastify'
function CreateGroupModal() {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [isUnique, setIsUnique] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const checkGroupNameUnique = async () => {
            setLoading(true)
            const isUniqueRes = await isGroupNameUnique({groupName:name})
            setIsUnique(isUniqueRes.data.data.isUnique)
            setLoading(false)
        }
        if(name.length > 0) {
            checkGroupNameUnique()
        }
        else {
            setIsUnique(true)
        }
    }, [name])

    const handleCreateGroup = async () => {
        try {
            const groupData = {
                name,
                description
            }
            await createGroup({groupData})
            window.location.reload()
        } catch{
            toast.error("Something went wrong. Please try again later.", {theme:"colored"})
        }
    }
  return (
    <div>
        <div className='flex flex-col gap-2' style={{marginTop:"20px"}}>

        <Input maxLength={20} placeholder='Name' value={name} onChange={(e) => setName(e.target.value)} />
        {!isUnique && <p className='text-red-500'>Group name already exists</p>}
        {loading && <p className='animate-spin
        inline-block
        size-6
        border-[3px]
        border-current
        border-t-transparent
        text-blue-600
        rounded-full
        '>  </p>}
        <p>{name.length}/20</p>

        <Input maxLength={100} placeholder='Description' value={description} onChange={(e) => setDescription(e.target.value)} />
        <p>{description.length}/100</p>
        </div>
        <Button className='mt-2' disabled={!isUnique || name.length === 0 || loading} onClick={handleCreateGroup}>Create Group</Button>
      
    </div>
  )
}

export default CreateGroupModal