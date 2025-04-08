import React, {useState, useEffect, useContext, createContext} from "react";
import {useNavigate, useLocation} from 'react-router-dom'
import { requestHandler,/*requestPermission*/ } from "@/utils";
import { loginUser, registerUser, logoutUser,getCurrentUser,updateAccountDetails,addPersonalDetails , updateProfilePicture, refreshToken,followOrUnfollow,checkToken,sendNotificationToUser} from "@/api/index";
import Loader from "@/components/Loader";
import { toast } from "react-toastify";
export interface UserInterface {
    _id: string;
    profilePicture: string;
    username: string;
    bio:string;
    phone:string;
    email: string;
    createdAt: string;
    updatedAt: string;
    followers: string[];
    following: string[];
    college:string;
    engineeringDomain:string;
    yearOfGraduation:string;
    isEmailVerified: boolean;
    token: string;
  }
  
const AuthContext = createContext<{
    user:UserInterface | null;
    token: string | null;
    login:(data:{email:string|null,username:string|null;password:string })=>Promise<void>;
    register:(data:FormData)=>Promise<void>;
    logout:()=>Promise<void>;
    getGoogleSignedInUser:({accessToken}:any)=>Promise<void>;
    updateAccDetails: (data:{username:string|null, email:string|null, bio:string|null})=>Promise<void>;
    updatePersonalDetails:(data:{ phone:string|null, engineeringDomain:string|null, college:string|null, yearOfGraduation:string|null })=>Promise<void>;
    updatePFP: (data: FormData) => Promise<void>;
    //postIMG:(data:FormData)=>Promise<void>;
    authError:string|null;
    isLoading:boolean;
    setIsLoading:(isLoading:boolean)=>void;
    followOrUnfollowUser:(userId:string)=>Promise<void>;
    following:string[];
    setUser:(user:UserInterface | null)=>void;
    setAuthError:(authError:string|null)=>void;
}>({
    user:null,
    token:null,
    login:async()=>{},
    register:async()=>{},
    logout:async()=>{},
    getGoogleSignedInUser:async()=>{},
    updateAccDetails:async()=>{},
    updatePersonalDetails:async()=>{},
    updatePFP: async () => { },
    //postIMG:async()=>{},
    authError:null,
    isLoading:false,
    setIsLoading:()=>{},
    followOrUnfollowUser:async()=>{},
    following:[],
    setUser:()=>{},
    setAuthError:()=>{},

});

const useAuth = () => useContext(AuthContext);

const AuthProvider:React.FC<{children:React.ReactNode}> = ({children}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<UserInterface | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [authError, setAuthError] = useState<string|null>('')
    const [following, setFollowing] = useState<string[]>([]);
    const navigate = useNavigate();
    const location = useLocation();
    const login = async (data:{email:string|null,username:string|null;password:string }) => {
        await requestHandler(
            async () => await loginUser(data),
            setIsLoading,
            (res) => {
                setUser(res.data.user);
                setToken(res.data.accessToken);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                localStorage.setItem("token", res.data.accessToken);
                setAuthError(null);
                // requestPermission().then(()=>{
                const currentUser = res.data.user
                if(!currentUser?.college && !currentUser?.engineeringDomain){
                    return navigate("/add-personal-details");
                
                }
               
                const savedLocation = location.state?.from || '/profile';
            navigate(savedLocation);
        // }
    // )
            },
            (err:any)=>{
                if(err.status == 401){
                    setAuthError("Invalid Credentials");
                }
                else if(err.status == 404){
                    setAuthError("Please make sure you have entered correct username/email")
                }
                else if(err.status == 403){
                    setAuthError("You are blocked because you have a illegitimate account, or have posted some illegal content");
                }
                else{
                    setAuthError("Something went wrong, please try again later");
                }
            }
        );
    }
    const register = async (data:FormData) => {
        await requestHandler(
            async () => await registerUser(data),
            setIsLoading,
            ()=>{
                setAuthError(null)
                navigate("/login");
            },
            (err:any)=>{
                if(err.status == 400){
                    setAuthError("User with this email already exists, please login");
                }
                else{
                    setAuthError("Something went wrong, please try again later");
                }
            }
        );
    }

    const logout = async () => {
        await requestHandler(
            async () => await logoutUser(),
            setIsLoading,
            ()=>{
                setUser(null);
                setToken(null);
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                navigate("/login");
            },
            (err:any)=>{
                if(err.status == 403){
                    refreshAccessToken().then(()=>logout())
                    .catch(()=>{
                        toast.error("Something went wrong, please try again later")
                    })
                    
                }
                else{
                    toast.error("Something went wrong, please try again later")
                }
            }
        );
    }

    const followOrUnfollowUser = async(userId:string)=>{
        await requestHandler(
            async()=>await followOrUnfollow({userId}),
            ()=>{},
            (res)=>{
                setUser(res.data.currentUser);
                localStorage.setItem("user", JSON.stringify(res.data.currentUser));
                if((res.data.currentUser.following.includes(userId))){
                   sendNotificationToUser(
                    {
                        userId,
                        body:`${res.data.currentUser.username} has started to follow you`,
                        title:`Hey`
                    
                    }
                   )
                }
                setFollowing(res.data.currentUser.following);

            },
            (err:any)=>{
                if(err.status == 403){
                    refreshAccessToken().then(()=>followOrUnfollowUser(userId))
                    .catch(()=>{
                        toast.error("Something went wrong, please try again later")
                    })
                }
                else{
                    toast.error("Something went wrong, please try again later")
                }
            }
        )
    }
    const refreshAccessToken = async()=>{
        await requestHandler(
            async()=>await refreshToken(),
            setIsLoading,
            (res)=>{
                setToken(res.data.accessToken);
                localStorage.setItem("token", res.data.accessToken);
            },
            (err:any)=>{
                if(err.status == 401){
                    setUser(null);
                    setToken(null);
                    localStorage.removeItem("user");
                    localStorage.removeItem("token");
                    navigate("/login");
                }
            }
        )
    }
    const checkTokenValidity = async()=>{
        await requestHandler(
            async()=>await checkToken(),
            setIsLoading,
            (_res)=>{
            },
            async(err:any)=>{
                if(err.status == 403){
                    refreshAccessToken()
                }
                if(err.status == 402){
                    toast.error("You are blocked, if you think this is a mistake please contact")
                    await logout()
                    // localStorage.clear()
                    // navigate('/login');
                }
                if(err.status == 420){
                    toast.error("Looks like your email is not verified")
                    const user = JSON.parse(localStorage.getItem('user') as string);
                    if(user){
                        user.isEmailVerified = false;
                    }                    
                    localStorage.setItem("user", JSON.stringify(user));
                    setUser(user)
                    navigate('/send-email-verification')
                }
            }
        )
    }
    
    

    const getGoogleSignedInUser = async({accessToken}:any)=>{
        await requestHandler(
            async()=>await getCurrentUser(),
            setIsLoading,
            (res)=>{
                setUser(res.data);
                setToken(accessToken);
                localStorage.setItem("user", JSON.stringify(res.data));
                localStorage.setItem("token", accessToken);
            },
            alert
        )
    }
    const updateAccDetails = async(data:{username:string|null, email:string|null, bio:string|null})=>{
        await requestHandler(
            async()=>await updateAccountDetails(data),
            setIsLoading,
            (res)=>{
                setUser(res.data.user);
                if(res.data.isEmailChanged){
                    navigate('/send-email-verification')
                }
                localStorage.setItem("user", JSON.stringify(res.data.user));
            },
            (err:any)=>{
                if(err.status == 403){
                    refreshAccessToken().then(()=>updateAccDetails(data))
                    .catch(()=>{
                        toast.error("Something went wrong, please try again later")
                    })
                }
                else{
                    toast.error("Something went wrong, please try again later")
                }
            }

        )
    }
    const updatePersonalDetails = async(data:{ phone:string|null, engineeringDomain:string|null, college:string|null, yearOfGraduation:string|null })=>{
        await requestHandler(
            async()=>await addPersonalDetails(data),
            setIsLoading,
            (res)=>{
                setUser(res.data);
                localStorage.setItem("user", JSON.stringify(res.data));
                navigate('/profile')
            },
            (err:any)=>{
                if(err.status == 403){
                    refreshAccessToken().then(()=>updatePersonalDetails(data))
                    .catch(()=>{
                        toast.error("Something went wrong, please try again later")
                    })
                }
                else{
                    toast.error("Something went wrong, please try again later")
                }
            }
        )
    }
    const updatePFP = async(data:FormData)=>{
        await requestHandler(
            async()=>await updateProfilePicture(data),
            setIsLoading,
            (res)=>{
                setUser(res.data);
                localStorage.setItem("user", JSON.stringify(res.data));
            },
            (err:any)=>{
                if(err.status == 403){
                    refreshAccessToken().then(()=>updatePFP(data))
                    .catch(()=>{
                        toast.error("Something went wrong, please try again later")
                    })
                }
                else{
                    toast.error("Something went wrong, please try again later")
                }
            }
        )
    }


    //     const postIMG = async(data:FormData)=>{
    //     await requestHandler(
    //         async()=>await updateProfilePicture(data),
    //         setIsLoading,
    //         (res)=>{
    //             setUser(res.data);
    //             localStorage.setItem("user", JSON.stringify(res.data));
    //         },
    //         (err:any)=>{
    //             if(err.status == 403){
    //                 refreshAccessToken().then(()=>postIMG(data))
    //                 .catch(()=>{
    //                     toast.error("Something went wrong, please try again later")
    //                 })
    //             }
    //             else{
    //                 toast.error("Something went wrong, please try again later")
    //             }
    //         }
    //     )
    // }
   
     // Check for saved user and token in local storage during component initialization
     useEffect(() => {
        const initializeAuth = async () => {
            setIsLoading(true);
            const _token = localStorage.getItem("token");
            const _user: any = localStorage.getItem("user");
            if (_token && _user) {
                setUser(JSON.parse(_user));
                setToken(_token);
                setFollowing(JSON.parse(_user).following);
            }
            setIsLoading(false);
        };
        initializeAuth();
        checkTokenValidity();
    }, []);
  return (
    <AuthContext.Provider value={{ user,following, login, register, logout, token, getGoogleSignedInUser,updateAccDetails,updatePersonalDetails,updatePFP,authError,isLoading,setIsLoading,followOrUnfollowUser,setUser, setAuthError}}>
      {isLoading ? <Loader /> : children} {/* Display a loader while loading */}
    </AuthContext.Provider>
  );
}

export {AuthContext, AuthProvider, useAuth}
