import { forgotPassword } from '@/api/index';
import NavBar from '@/components/sections/NavBar';
import { Button } from '@/components/ui/button'
import { Card,CardContent,CardDescription,CardFooter,CardHeader,CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {useState} from 'react'
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [sendLoading, setSendLoading] = useState(false);
    const onSendClick = ()=>{

        if(!email){
            setError('Please enter your email')
            return
        }
        setSendLoading(true)
        forgotPassword({email}).then(()=>{
            toast.success('Check your email for reset link')
            setEmail('')
            setError('')
        })
        .catch((err)=>{
            if(err.status == 404){
                toast.error('Sorry, there is no user with that email please register first or enter the email you registered with')
                setError('Sorry, there is no user with that email please register first or enter the email you registered with')
            }
            else{
                toast.error('Something went wrong please try again later')
            }
        })
        .finally(()=>{
            setSendLoading(false)
        })
    }
  return (
    <div>
        <NavBar/>
        <div className='w-full h-full '>
        
      <Card className='max-w-[90vw] md:max-w-[60vw] mx-auto mt-10'>

        <CardHeader>
          <CardTitle>
            Forgot Password
          </CardTitle>
          <CardDescription>
            Enter your email to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input value={email} onChange={(e)=>setEmail(e.target.value)} className={`${error?'border-2 border-solid border-red-500':''}`} type="email" placeholder="Email" />

          {error && <p className='text-red-500'>{error}</p>}
          <Button onClick={onSendClick} className='w-full mt-4'>{sendLoading? <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-gray-300 dark:border-black"></div>:'Send'}</Button>
        </CardContent>
        <CardFooter>
          <p>Remember your password? <Link to="/login" className='text-blue-500'>Login</Link></p>
        </CardFooter>
      </Card>
        </div>
    </div>
  )
}

export default ForgotPassword
