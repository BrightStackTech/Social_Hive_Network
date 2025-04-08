import { sendVerificationEmail } from '@/api/index';
import LogoutButton from '@/components/modules/LogoutButton';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function SendVerificationEmail() {
    const { user} = useAuth();

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const sendVerification = async () => {
        if(user?.isEmailVerified) {
            return navigate('/profile');
        }   
        try {
            setLoading(true);
            await sendVerificationEmail();
            setEmailSent(true);
            toast.success("Check your email for verification link");
        } catch (error:any) {
            if(error.status == 400) {
                setEmailSent(true);
                toast.error("An email is already sent to specified email address");
            }
            else toast.error("Something went wrong, please try again later");
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        sendVerification();
    },[])
  return (
    <div>
        {loading && <p>Sending verification email...</p>}
        {!loading && emailSent && <div className='text-center'>
            A verification link has been sent to {user?.email}. Please check your email and click on the link to verify your email.
            <LogoutButton className='block sm-show-text mx-auto'/>
        </div>}
    </div>
  )
}

export default SendVerificationEmail
