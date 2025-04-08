import React,{useState} from 'react'
import NavBar from '@/components/sections/NavBar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import SelectWithSearch from '@/components/modules/SelectWithSearch'
import { colleges,branches } from '@/constants'

function AddPersonalDetails() {
  document.title = "SocialHive - Add Personal Details"
    const [college, setCollege] = useState('')
    const [engineeringDomain, setEngineeringDomain] = useState('')
    const [yearOfGraduation, setYearOfGraduation] = useState<string>('')
    const [phone, setPhone] = useState<string>('')
    const [valError,  setValError] = useState<string>('')
   const {user, updatePersonalDetails} = useAuth()

   const handleSubmit = (e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault()
    if(!college){

        setValError('Please select a college')
        return
    
    }
    if(!engineeringDomain){
        setValError('Please select a branch')
        return
    }
    if(yearOfGraduation.length < 4 || 
        isNaN(Number(yearOfGraduation))
        ){
        setValError('Please enter a valid year of graduation')
        return
    
        }
    
    if(yearOfGraduation.length !== 4 || isNaN(Number(yearOfGraduation))){
        setValError('Please enter a valid year of graduation')
        return
    }
    if(phone && phone.length !== 10 || isNaN(Number(phone))){
        setValError('Please enter a valid phone number')
        return
    }
    setValError('')
    updatePersonalDetails({
        college,
        engineeringDomain,
        yearOfGraduation,
        phone
    })
   }
    
  return (
    <>
    <NavBar className='mb-5'/>
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
        Hey, {user?.username}
      </h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
        These details will be used for providing better app experience to you.
      </p>
      <form className="my-8" onSubmit={handleSubmit}>

        {valError
        && <div className="text-red-500 text-sm m-2 ml-0">{valError}</div>}
       
        <LabelInputContainer className="mb-4">
          <Label htmlFor="college">College 
             <span className="text-red-500 ml-1">*</span>
          </Label>
          <SelectWithSearch id="college" options={colleges} setValue={(option:any)=>{
            setCollege(option)
          }}/>
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="branch">Branch 
            <span className="text-red-500 ml-1">*</span> 
          </Label>
       
          <SelectWithSearch id='branch' options={branches} setValue={
            (option:any)=>{
                setEngineeringDomain(option)
            }
          } />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="year">Year of Graduation
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input id="year" value={yearOfGraduation} onChange={(e) => setYearOfGraduation(e.target.value)} placeholder="2024" type="text"/>
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="phone">Phone</Label>
          <Input id="ohone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="1234567890" type="text" />
        </LabelInputContainer>
        <button
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          type="submit"
        >
          Submit &rarr;
          <BottomGradient />
        </button>

      
        
      </form>
          
    </div>
    </>
  )
}

export default AddPersonalDetails
const BottomGradient = () => {
    return (
      <>
        <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
        <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
      </>
    );
  };
  
  const LabelInputContainer = ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => {
    return (
      <div className={cn("flex flex-col space-y-2 w-full", className)}>
        {children}
      </div>
    );
  };
  