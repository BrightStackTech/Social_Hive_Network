import { useAuth } from '@/context/AuthContext';
import NavBar from '@/components/sections/NavBar';
import React, {useEffect, useState} from "react";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { cn } from "@/lib/utils";
import { FcGoogle } from "react-icons/fc";
import { Link } from 'react-router-dom';
import Footer from '@/components/sections/Footer';
import { Separator } from '@/components/ui/separator';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
export default function LoginForm() {
  const { login, authError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  useEffect(
    ()=>{
      document.title = "SocialHive- Login"
    }

    
    ,[])
  const handleLogin = async (e:any) => {
    e.preventDefault();

      if(username.includes('@')){
          await login({ email: username,username:null, password });
        }
        else{
          
          await login({email:null, username, password });
          
        }
   
  };
  
  return (
    <>
    <NavBar className='mb-5'/>
    <div className="max-w-md w-full my-6 mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <h2 className="font-bold text-lg md:text-xl text-neutral-800 dark:text-neutral-200">
        Welcome back to SocialHive
      </h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
        Don't have an account? <Link className='underline' to='/register'>Register here</Link>
      </p>
      <form className="my-8" onSubmit={handleLogin}>
       
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address / Username</Label>
          <Input id="email" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="yourname@example.com" type="text" />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <div className='flex justify-between'>
            <Label htmlFor="password">Password</Label>
            <Link className='text-sm underline' to='/forgot-password'>Forgot Password?</Link>
          </div>
          <div className="flex justify-around items-center">
            <div className="w-full mr-1">
          <Input value={password}  required={true} onChange={(e) => setPassword(e.target.value)} id="password" placeholder="••••••••" type={showPassword ? "text" : "password"} />
            </div>
          <button type="button" onClick={togglePasswordVisibility} className="absolut w-fit right3 tp-7 text-white">
            {showPassword ? <FaEyeSlash className="text-black dark:text-white "/> : <FaEye className="text-black dark:text-white"/>}
          </button>
          </div>
        </LabelInputContainer>
       {authError && <div className="text-red-500 text-sm m-2">{authError}</div>}

        <button
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          type="submit"
        >
          Login &rarr;
          <BottomGradient />
        </button>

        <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

        
      </form>
          <form action={`${import.meta.env.VITE_SERVER_URI}/users/login/google`} method="get">
          <button
            className=" relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]">
            
            <FcGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
            <span className="text-neutral-700 dark:text-neutral-300 text-sm">
             Sign in with Google
            </span>
            <BottomGradient />
          </button>
</form>
    </div>
    <Separator/>
    <Footer/>
    </>

  );
}

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
