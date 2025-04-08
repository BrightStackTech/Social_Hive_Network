import { resetPassword, signedInResetPassword } from "@/api/index";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "react-toastify"
import { useAuth } from "@/context/AuthContext"
import { EyeOff, Eye } from "lucide-react"
import { Card } from "@/components/ui/card"
function ResetPassword() {
  document.title = "TCN | Reset Password"
  const { token } = useParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()
  const {user,setUser} = useAuth()
  const handleResetPassword = async() => {
    if(!token){
      toast.error("Invalid token")
      return
    }
    
    if(password !== confirmPassword){
      setError("Passwords do not match")
      return
    }
    if(user){
      signedInResetPassword({token, password}).then(()=>{
        toast.success("Password reset successfully")
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setUser(null)
        navigate("/login")
      }).catch(()=>{
        toast.error("Sorry, the password reset link is invalid or has expired")
      })
      return
    }
    else{
    resetPassword({token, password}).then(()=>{
      toast.success("Password reset successfully")
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      setUser(null)
      navigate("/login")
    }).catch(()=>{
      toast.error("Sorry, the password reset link has expired")
    })}
  }
  return (
    <div className="w-full">
      <div className="bg-gray-300 dark:bg-black w-full sticky top-0 flex justify-center items-center">
        <img src="/TCN%20Logo%20WO%20BG.png" alt="TCN Logo" className="w-16 h-16 md:w-20 md:h-20" />
        <h1 className="text-2xl md:text-3xl font-bold text-center">SocialHive</h1>
      </div>
      <Card className="mt-10 p-5 max-w-[90vw] md:max-w-[60vw] mx-auto">

    <div className="flex  w-full h-full flex-col justify-center items-center gap-4">
      {error && <p className="text-sm text-red-500">{error}</p>}
      <h1 className="text-2xl font-bold">Reset Password</h1>
      <p className="text-sm">Enter your new password below</p>
      <div className="relative flex items-center justify-around  w-[90%] ">
        <div className="w-full mr-1 ">
        <Input type={`${showPassword?'text':'password'}`} className="w-full" placeholder="New Password" value={password} onChange={(e)=>setPassword(e.target.value)}/>
        </div>
        <span className=" cursor-pointer" onClick={()=>setShowPassword(!showPassword)}>{showPassword?<EyeOff/>:<Eye/>}</span>
      </div>
      <div className="relative flex justify-around items-center  w-[90%] ">
      <div className="w-full mr-1">
        <Input className="w-full" type={`${showConfirmPassword?'text':'password'}`} placeholder="Confirm New Password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)}/>
      </div>
        <span className="cursor-pointer" onClick={()=>setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword?<EyeOff/>:<Eye/>}</span>
      </div>
      <Button disabled={!password || !confirmPassword} onClick={handleResetPassword}>Reset Password</Button>
    </div>
      </Card>
    </div>
  )    
}

export default ResetPassword
