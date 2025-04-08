import React, { useEffect, useState, useRef } from 'react'
import {useAuth} from '@/context/AuthContext'
import ProfileSideBar from '@/components/sections/ProfileSideBar'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { checkUsernameUnique } from "@/api/index";
import { Button } from '@/components/ui/button'
import {Dialog,DialogContent,DialogClose,DialogTrigger,DialogTitle} from '@/components/ui/dialog'
import SelectWithSearch from '@/components/modules/SelectWithSearch'
import { branches, colleges } from '@/constants'
import MobileUserNavbar from '@/components/sections/MobileUserNavbar'
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";

function EditProfile() {
    document.title = "SocialHive - Edit Profile"
    const {user, updateAccDetails, updatePersonalDetails,updatePFP} = useAuth()
    const pathname = window.location.pathname
    const [username, setUsername] = useState<string>(user?.username!)
    const [email, setEmail] = useState<string>(user?.email!)
    const [bio, setBio] = useState<string>(user?.bio!)
    const [phone, setPhone] = useState<string>(user?.phone!)
    const [college, setCollege] = useState<string>(user?.college!)
    const [engineeringDomain, setEngineeringDomain] = useState<string>(user?.engineeringDomain!)
    const [yearOfGraduation, setYearOfGraduation] = useState<string>(user?.yearOfGraduation!)
    const [isUnique, setIsUnique] = useState(true);
    const [error, setError] = useState('')
    const [profilePicture, setProfilePicture] = useState<File | null | undefined>(null);
    const [profilePictureUrl, setProfilePictureUrl] = useState<string>(user?.profilePicture!);
    const [valError, setValError] = useState('')
    const scrollableDiv = useRef<HTMLDivElement>(null);
    const cropperRef = useRef<ReactCropperElement>(null)
    const navigate = useNavigate()
    const checkUsername = async () => {
      if (username.length>0&&username.length < 6) {
        setIsUnique(false);
        setError('Username must be at least 6 characters long');
      } else {
        const usernameRegex = /^[a-zA-Z_][a-zA-Z0-9_@]*$/;
        if(username.length>0&&!usernameRegex.test(username)){
          setError('Username can only contain alphanumeric characters, underscores and @, and should start with an alphabet');
        }
        else{
        try {
          if(username!==user?.username){
            const response = await checkUsernameUnique(username);
          const data = response.data.data
          setIsUnique(data.isUnique);
          setError('');
          }
          
        } catch (error) {
          setIsUnique(false);
          setError('')
        }
      }
      }
    };
    const handlePFPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfilePictureUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
        setProfilePicture(file);
      }
    }
    useEffect(() => {
      if(username.length==0){
        setIsUnique(false)
        setError('Username cannot be empty')
        return
      }
      if(user?.username !== username){
        checkUsername()
      }
      else{
        setIsUnique(true)
        setError('')
      }

      
    }, [username])
    
    const handleAccountSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      await updateAccDetails({username, email, bio})
    }
    const handlePersonalSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if(!college){
        setValError('College is required')
        return
      }
      if(!engineeringDomain){
        setValError('Engineering Domain is required')
        return
      }
      if(yearOfGraduation.length < 4 || isNaN(
        Number(yearOfGraduation)
      )){
        setValError('Enter a valid year of graduation')
        return
      }
      if(college == user?.college
        && engineeringDomain == user?.engineeringDomain
        && yearOfGraduation == user?.yearOfGraduation
        && phone == user?.phone
      ){
        
        return navigate('/profile')
      }
      
      setValError('')
      await updatePersonalDetails({phone, college, engineeringDomain, yearOfGraduation})
    }
    
    const handleUpdatePFP = async() => {
      if(profilePicture){
        if(cropperRef.current){
          const cropper = cropperRef.current.cropper
          const canvas = cropper.getCroppedCanvas()
          canvas.toBlob(async(blob) => {
            if(blob){
              const file = new File([blob], 'profile_picture.jpg', {type: 'image/jpeg'})
              const data = new FormData()
              data.append('profilePicture', file)
              await updatePFP(data)
            }
          }, 'image/jpeg', 0.8)
        }
       

      }
    }
  return (
    <div className='w-screen'>
      {user && (
        <div className="flex">
          <div className="hidden md:block md:w-1/4 border-0 border-r-[1px] h-screen">
            <ProfileSideBar />
          </div>
          <div ref={scrollableDiv} className="w-full md:w-3/4 overflow-y-scroll scrollbar-hide border-0 border-r-[1px] h-screen">
          <MobileUserNavbar scrollableDiv={scrollableDiv}/>
            <div className="flex border-0 border-b">
              <Link to='/profile'
                className={`w-1/3 py-5 text-center cursor-pointer ${
                  pathname == "/profile"
                    ? "font-bold text-lg text- bg-muted border-0 border-b-4 border-blue-500"
                    : "hover:bg-slate-900 duration-200"
                }`}
              >
                Profile
              </Link>
              <div className={`w-1/3 py-5 text-center cursor-pointer ${
                  pathname == "/editProfile"
                    ? "font-bold text-lg text- bg-muted border-0 border-b-4 border-blue-500"
                    : "hover:bg-slate-900 duration-200"
                }`}>
                Edit Profile
              </div>
              <Link
                to="/profile-analytics"
                className="py-5 w-1/3 text-center cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-900 duration-200"
              >
                Analytics
              </Link>
            </div>
            <div>
                <img src={user.profilePicture} className="w-52 h-52 rounded-full mx-auto mt-10 mb-4" alt="" />
                <div className='flex gap-3 justify-center w-80 mx-auto'>
                  <Dialog>
                <DialogTrigger>
              <div className=' text-blue-400 cursor-pointer font-semibold'>Edit Profile Picture</div>
                </DialogTrigger>
                <DialogContent  className='w-[85%]'>
                  <DialogTitle className='text-center font-bold mt-4'>Update Profile Picture</DialogTitle>

                  <Input type='file' onChange={handlePFPChange} />

                 {profilePicture &&  <div className=' mx-auto max-h-[90vh] mt-4'>
                    <Cropper
                      ref={cropperRef}
                      src={profilePictureUrl}
                      aspectRatio={1 / 1}
                      style={{ height: 300, width: '100%' }}
                      background={false}
                      guides={true}
                    />
                  </div>}
                  <Button onClick={handleUpdatePFP} className='w-full mt-4'>Update</Button>
                  <DialogClose className='text-center mt-4'>Close</DialogClose>
                    
                </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger>
                    <div className=' text-blue-400 cursor-pointer font-semibold'>View Profile Picture</div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogTitle className='text-center font-bold mt-4'>Profile Picture</DialogTitle>
                      <img src={user.profilePicture} className='mx-auto w-/2 h-/2' alt="" />
                      <DialogClose className='text-center mt-4'>Close</DialogClose>
                    </DialogContent>
                  </Dialog>
                </div>
            </div>
            <form onSubmit={handleAccountSubmit}>
            <div className='m-5'>
                <Label htmlFor="username" className='text-xl p-1 font-bold'>Username</Label>
                <Input id="username" value={username} className='my-1' onChange={(e) => setUsername(e.target.value)}  type='text' />
                {(!isUnique || !!error) ? <p className='text-red-500'>{error || "Username already taken"}</p>: (user.username !== username) &&
                <p className='text-green-500'>Username available</p>}
            </div>
            <div className='m-5'>
                <Label htmlFor="bio" className='text-xl p-1 font-bold'>Bio</Label>
                <Input id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className='my-1' type='text' />
            </div>
           <div className='m-5'>
            <Label htmlFor="email" className='text-xl p-1 font-bold'>Email</Label>
            <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className='my-1' type='email' />
           </div>
           <div className='w-fit ml-auto'>
            <Button disabled={!isUnique || !!error} type="submit" className='m-5 '>Update account details</Button>
           </div>
           </form>
           <div className='w-full bg-muted h-[1px]'></div>
            <div className="mx-auto my-4 w-fit text-2xl font-bold">Personal Details</div>
            <form onSubmit={handlePersonalSubmit}>
                {valError && <p className='text-red-500 mx-5'>{valError}</p>}

            <div className='m-5'>
                <Label htmlFor="Phone number" className='text-xl p-1 font-bold'>Phone number</Label>
                <Input id="Phone number" className='my-1' value={phone} onChange={(e) => setPhone(e.target.value)} type='text' />
            </div>
            <div className='m-5'>
                <Label htmlFor="college" className='text-xl p-1 font-bold'>College</Label>
                <SelectWithSearch id="college" options={colleges} initialValue={user.college} setValue={(option:any)=>{
            setCollege(option)
          }}/>            </div>
            <div className='m-5'>
                <Label htmlFor="engineeringDomain" className='text-xl p-1 font-bold'>Engineering Domain</Label>
                <SelectWithSearch id="engineeringDomain" options={branches} initialValue={user.engineeringDomain} setValue={(option:any)=>{
            setEngineeringDomain(option)
          }}/>  
            </div>
            <div className='m-5'>
                <Label htmlFor="yearOfGraduation" className='text-xl p-1 font-bold'>Year of Graduation</Label>
                <Input id="yearOfGraduation" className='my-1' value={yearOfGraduation} onChange={(e) => setYearOfGraduation(e.target.value)} type='text' />
            </div>
            <div className='w-fit ml-auto'>
            <Button type="submit" className='m-5 '>Update account details</Button>
            </div>
            </form>


        </div>
        </div>
      )}
    </div>
  )
}

export default EditProfile
