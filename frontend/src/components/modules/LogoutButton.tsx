import { Button } from '../ui/button'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom' 
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import {LogOut} from 'lucide-react'
const LogoutButton = ({className, variant}:{className?:string, variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined}) => {
    const navigate = useNavigate();
    const {logout} = useAuth();
  const handleLogout = () => {
    logout();
    navigate('/login');
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
    <Button className={className} variant={variant}>
      <div className='flex justify-center items-center'>

    <LogOut className='w-4 h-4 mr-2' />
    <div className={` md:block ${className?.includes('sm-show-text')?"block":"hidden"}`}>Logout</div>
      </div>
    </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
        
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={handleLogout}>Continue</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
  )
}
  

export default LogoutButton
