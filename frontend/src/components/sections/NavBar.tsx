import LoginButton from '../modules/LoginButton'
import AccountDropdown from '../modules/AccountDropdown'
// import SearchBar from '../modules/SearchBar'
import { /*Contact,*/ Edit, Home, Info, Users,Menu } from 'lucide-react'
import { ModeToggle } from '../mode-toggle'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '../ui/button'
import {Sheet, SheetContent, SheetTrigger } from '../ui/sheet'


const NavBar = ({className}:any) => {
  const pathname = window.location.pathname
  const {user} = useAuth()
  return (
    <div className={'flex items-center justify-around  bg-white dark:bg-black px-5 py-5 ' + className || ''}>
      {/* <Link to='/' className='title cursor-pointer text-black font-bold text-2xl md:text-xl xl:text-2xl dark:text-white'>SocialHive</Link> */}
     
     <Link to={"/"} className='flex items-center'> <img src="/TCN%20Logo%20WO%20BG.png" className='w-16 h-16' alt="" />
     <div className='font-bold'>SocialHive</div>
     </Link>
      <div className='menus hidden xl:block xl:ml-10'>
        <ul className='flex gap-10 text-black dark:text-white'>
          <Link to='/' className='cursor-pointer hover:underline'>Home</Link>
          <Link to={`${pathname != '/add-personal-details'?'/groups':'/add-personal-details'}`} className='cursor-pointer hover:underline'>Groups</Link>
          <Link to={`${pathname != '/add-personal-details'?'/explore':'/add-personal-details'}`} className='cursor-pointer hover:underline'>Posts</Link>
          <Link to='/about-the-site' className='cursor-pointer hover:underline'>About</Link>
          {/* <Link to='/contact' className='cursor-pointer hover:underline'>Contact</Link> */}
        </ul>

      </div>

    {user?<div className='mx-5'>
     
    </div>:<div className='hidden lg:block mx-10'>
   
      <LoginButton />
    </div>}
    {/* <div className='hidden md:block md:ml-28 lg:ml-10'>
      <SearchBar />
    </div> */}
    <div className='ml-auto cursor-pointer hover:bg-muted p-2 rounded-md lg:hidden'>

    <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
               
                <Link
                  to="/"
                  className="flex items-center gap-4 px-2.5 text-foreground hover:text-foreground"
                >
                  <Home className="h-5 w-5" />
                  Home
                </Link>
                <Link
                  to="/groups"
                  className="flex text-muted-foreground hover:text-foreground items-center gap-4 px-2.5"
                >
                  <Users className="h-5 w-5" />
                  Groups
                </Link>
                <Link
                  to="/explore"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Edit className="h-5 w-5" />
                  Posts
                </Link>
                <Link
                  to="/about-the-site"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Info className="h-5 w-5" />
                  About
                </Link>
                {/* <Link
                  to="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Contact className="h-5 w-5" />
                  Contact
                </Link> */}
              </nav>
            </SheetContent>
    </Sheet>
    </div>
    <div className='ml-2 hidden lg:block'>
      <ModeToggle />
    </div>
      {user&&<div className='mx-5 flex items-center'>
        <AccountDropdown />
      
    </div>}
    </div>
  )
}

export default NavBar
