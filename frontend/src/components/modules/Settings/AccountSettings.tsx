import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Eye,
    EyeOff,   
} from 'lucide-react'
import { changePassword,forgotPassword, sendVerificationEmail} from "@/api/index"
import { toast } from "react-toastify"
import LogoutButton from "../LogoutButton"
import { useAuth } from "@/context/AuthContext"
function AccountSettings() {
    const {user} = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const handleShowPassword = () => {
        setShowPassword(!showPassword)
    }
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const handleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword)
    }
    const [showNewPassword, setShowNewPassword] = useState(false)
    const handleShowNewPassword = () => {
        setShowNewPassword(!showNewPassword)
    }
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [newConfirmPassword, setNewConfirmPassword] = useState("")
    const [resetPasswordEmail, setResetPasswordEmail] = useState(user?.email)
    const [verifyEmail, setVerifyEmail] = useState(user?.email)
    const [cperror, setCperror] = useState<null| string>(null)
    const [resetLoading, setResetLoading] = useState(false)
    const [verifyLoading, setVerifyLoading] = useState(false)
    const handlePasswordChangeSubmit = ()=>{
        if(!oldPassword || !newPassword || !newConfirmPassword){
            setCperror("All fields are required")
            return
        }
        if(newPassword !== newConfirmPassword){
            setCperror("Passwords do not match")
            return
        }
    if(oldPassword == newPassword ){
        setCperror("New password cannot be the same as old password")
        return
    }
        setCperror(null)
        changePassword({oldPassword,newPassword}).then(
            (res)=>{
                if(res.status == 200){
                    toast.success("Password Changed Successfully")
                    setOldPassword("")
                    setNewPassword("")
                    setNewConfirmPassword("")
                }
            }
        ).catch((err)=>{
            if(err.status == 400){
                setCperror("Invalid Old Password")
            }
        })
    }

    const handleForgotPasswordSubmit = () => { 
        if(!resetPasswordEmail){
            setCperror("Email is required")
            return
        }
        setCperror(null)
        setResetLoading(true)
        forgotPassword({email:resetPasswordEmail}).then(
            (res)=>{
                setResetLoading(false)
                if(res.status == 200){
                  toast.success("Check your email for reset password link")
                  setResetPasswordEmail("")
                }
              }
            ).catch((err)=>{
              if(err.status == 400){
                setCperror("Invalid Email")
              }
              else{
                toast.error("Something went wrong, please try again later")
              }
            })
            .finally(()=>setResetLoading(false))
    }

    const handleVerifyEmailSubmit = () => {
        if(!verifyEmail){
            setCperror("Email is required")
            return
        }
        setCperror(null)
        setVerifyLoading(true)
      sendVerificationEmail().then(()=>{
        toast.success("Check your email for verification link")
    })
      .catch(()=>[
        toast.error("Something went wrong")
      ])
      .finally(()=>{
        setVerifyLoading(false)
      })
    }

  return (
    <div className="grid gap-6 h-[60vh] md:h-[90vh]  scrollbar-hide overflow-y-auto">
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Enter your old password and a new password to change your password
          here.
          <br />
          <span className="text-red-500">{cperror}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex items-center">
            <div className="w-full mr-1">

          <Input type={showPassword ? "text" : "password"} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Old Password" />
          </div>
          {
            showPassword?<EyeOff onClick={handleShowPassword} className=""/>:<Eye onClick={handleShowPassword} className=""/>
          }
          </div>
          <div className="flex items-center">
          <div className="w-full mr-1">

          <Input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" />
          </div>
          {
            showNewPassword?<EyeOff onClick={handleShowNewPassword} className=""/>:<Eye onClick={handleShowNewPassword} className=""/>
          }
          </div>
          <div className="flex items-center">
          <div className="w-full mr-1">
          <Input type={showConfirmPassword ? "text" : "password"} value={newConfirmPassword} onChange={(e) => setNewConfirmPassword(e.target.value)} placeholder="Confirm Password" />
          </div>
          {
            showConfirmPassword?<EyeOff onClick={handleShowConfirmPassword} className=""/>:<Eye onClick={handleShowConfirmPassword} className=""/>
          }
          </div>
        
       
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button onClick={handlePasswordChangeSubmit}>Change</Button>
      </CardFooter>
    </Card>
    <Card x-chunk="dashboard-04-chunk-2">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
         Forgot your password? Reset it here by entering your email address.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4">
          <Input type="email" disabled title="If email is different first change the email in edit profile section" value={user?.email} onChange={(e) => setResetPasswordEmail(e.target.value)} placeholder="Email" />
        </form>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button onClick={handleForgotPasswordSubmit}>{resetLoading ? <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-gray-300 dark:border-black"></div>: "Reset"}</Button>
      </CardFooter>
    </Card>
    <Card x-chunk="dashboard-04-chunk-2">
      <CardHeader>
        <CardTitle>Verify Email</CardTitle>
        <CardDescription>
          Enter your email address to verify your email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4">
          <Input type="email" disabled title="If email is different first change the email in edit profile section"  value={verifyEmail} onChange={(e) => setVerifyEmail(e.target.value)} placeholder="Email" />
          
        </form>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button disabled={verifyLoading || user?.isEmailVerified} onClick={handleVerifyEmailSubmit}>{verifyLoading ? <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-gray-300 dark:border-black"></div>: "Verify"}</Button>
      </CardFooter>
    </Card>
    <Card>
        <CardHeader>
            <CardTitle>Logout</CardTitle>
            <CardDescription>
                Logout from your account on this device
            </CardDescription>
        </CardHeader>

        <CardContent>

    <LogoutButton className="sm-show-text w-full mx-auto my-2"/>
        </CardContent>
    </Card>
  

       
  </div>
  )
}

export default AccountSettings
