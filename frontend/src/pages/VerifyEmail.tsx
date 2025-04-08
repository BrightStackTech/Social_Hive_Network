import { verifyEmail } from "@/api/index";
import MobileUserNavbar from "@/components/sections/MobileUserNavbar"
import { useEffect, useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useAuth } from "@/context/AuthContext"

function VerifyEmail() {
    const navigate = useNavigate()
    const {token} = useParams()
    const [error, setError] = useState("")
    const {user} = useAuth()
    const [verifyLoading, setVerifyLoading] = useState(false)
    useEffect(() => {
        async function verifyEmailUsingToken() {
           setVerifyLoading(true)
           if(user?.isEmailVerified){
            return navigate('/profile')
           }
        if(!token) {
            toast.error("Invalid token")
            return
        }
        verifyEmail({token}).then(() => {
            toast.success("Email verified successfully")
            const userData = localStorage.getItem("user")
            if (userData) {
                const currUser = JSON.parse(userData)
                currUser.isEmailVerified = true
                localStorage.setItem("user", JSON.stringify(currUser))
            }
            window.location.reload()
            // navigate('/profile')
        })
        .catch(() => {
            toast.error("Something went wrong, please verify your email again")
            setError("Something went wrong, please verify your email again")
        })
        .finally(() => {
            setVerifyLoading(false)
        })
       } 
       verifyEmailUsingToken()
    },[])
  return (
    <div className="w-full">
      <MobileUserNavbar scrollableDiv={null}/>
    <div className="flex items-center justify-center w-full h-full">
            { verifyLoading && <div className="text-center">
                <h1 className="text-3xl font-bold">Verifying your email</h1>
                <p className="text-gray-500">Please wait while we verify your email</p>
            </div>}
            {error && <div className="text-center">
                <h1 className="text-3xl font-bold">Error</h1>
                <p className="text-gray-500">{error}</p>
            </div>}
            {!verifyLoading && !error && <div className="text-center">
                <h1 className="text-3xl font-bold">Email verified successfully</h1>
                <p className="text-gray-500">You can now go to the <Link to={'/profile'} className="text-blue-500 underline">Profile page</Link></p>
            </div>}

      
    </div>
    </div>

  )
}

export default VerifyEmail
