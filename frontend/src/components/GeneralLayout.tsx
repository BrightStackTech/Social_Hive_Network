import ProfileSideBar from "./sections/ProfileSideBar"
import { Outlet,useLocation  } from "react-router-dom"
import { useEffect, useState } from 'react';

function GeneralLayout() {
  const location = useLocation()
  const [_, setKey] = useState(0);

  useEffect(() => {
    // This effect will run every time the pathname changes
    setKey(prevKey => prevKey + 1);
  }, [location.pathname]);
  return (
    <div className="flex max-w-screen">
       <div className="hidden md:block md:w-1/4 h-screen border-0 border-r" style={{minWidth:"25%"}}>
        <ProfileSideBar/>
       </div>
       
        <Outlet />
    </div>
  )
  
}

export default GeneralLayout
