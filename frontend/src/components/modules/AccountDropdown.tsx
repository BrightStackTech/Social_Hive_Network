import React from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { Button } from '../ui/button'
import { AuthContext } from '@/context/AuthContext'
import { Link } from 'react-router-dom'
import LogoutButton from './LogoutButton'
function AccountDropdown() {
    const { user} = React.useContext(AuthContext)
    const pathname = window.location.pathname
  
  return (
    <div>
       {user && <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">
      <div className='hidden md:block mx-2'>{user.username.charAt(0).toUpperCase() + user.username.slice(1)}</div>
                <img className="rounded-full w-10 h-10 py-1 px-1" src={user.profilePicture} alt="" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>  
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {pathname != '/add-personal-details' && pathname!='reset-password'&& <DropdownMenuItem>

              <Link to={'/profile'}>Profile</Link>
              </DropdownMenuItem>}
            
              {pathname != '/add-personal-details' && pathname!='reset-password' &&<DropdownMenuItem>
              
              <Link to={'/settings'}>Settings</Link>
              </DropdownMenuItem>}
              <DropdownMenuSeparator />
              <LogoutButton variant={"outline"} className='sm-show-text'/> 
            </DropdownMenuContent>
          </DropdownMenu>}
    </div>
  )
}

export default AccountDropdown
