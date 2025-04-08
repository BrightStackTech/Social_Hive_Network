import { useEffect, useState, useRef, useCallback } from "react";
import {Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {Menu,Compass, Search, User,Settings,MessageCircle } from 'lucide-react'
import AccountDropdown from "@/components/modules/AccountDropdown";
import { FaGlobe, FaUsers, FaTv } from "react-icons/fa";

import { Link } from "react-router-dom";

function MobileUserNavbar({ scrollableDiv }: { scrollableDiv: React.RefObject<HTMLDivElement> | null}) {
  const [isHidden, setIsHidden] = useState(false); // To manage hidden class
  const mobileNavbar = useRef<HTMLDivElement | null>(null);
  const pathname = window.location.pathname;

  const lastScrollTopRef = useRef(0);

  const handleScroll = useCallback(() => {
    const currentScrollTop = scrollableDiv?.current?.scrollTop || 0;

    if (currentScrollTop > lastScrollTopRef.current && !isHidden) {
      // Scrolling down, and navbar is visible
      setIsHidden(true); // Hide the navbar
    } else if (currentScrollTop < lastScrollTopRef.current && isHidden) {
      // Scrolling up, and navbar is hidden
      setIsHidden(false); // Show the navbar
    }

    lastScrollTopRef.current = currentScrollTop;
  }, [isHidden, scrollableDiv]);

  useEffect(() => {
    const currentScrollableDiv = scrollableDiv?.current;
    if (currentScrollableDiv) {
      currentScrollableDiv.addEventListener("scroll", handleScroll);
      return () => {
        currentScrollableDiv.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll, scrollableDiv]);
  


  return (
    <div
      ref={mobileNavbar}
      className={`sticky top-0 md:hidden shadow-md shadow-background flex items-center justify-between px-3  bg-muted w-full border-0 border-b-2 border-muted-foreground ${isHidden ? "opacity-0 z-50" : "opacity-100 z-[1000000]"} duration-300`}
    >
      <div className="flex gap-1 items-center">
        <img src="/TCN%20Logo%20WO%20BG.png" className="w-14 h-14" alt="" />
        <div className="font-bold">SocialHive</div>
      </div>
      <div className="flex gap-2 items-center">
        <AccountDropdown />
        <Sheet>
          <SheetTrigger asChild>
            <div>
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </div>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-xs">
            <nav className="grid gap-3 text-lg font-medium">
              <Link
                to="/explore"
                className={`hover:bg-muted flex gap-2 items-center text-lg p-3 ${
                  pathname === "/explore" ? "bg-muted text-xl font-bold" : ""
                }`}
              >
                <Compass strokeWidth={pathname === "/explore" ? 4 : 2} className="md:mx-0" />
                <div>Explore</div>
              </Link>
              <Link
                to="/search"
                className={`hover:bg-muted flex gap-2 items-center text-lg p-3 ${
                  pathname === "/search" ? "bg-muted text-xl font-bold" : ""
                }`}
              >
                <Search strokeWidth={pathname === "/search" ? 4 : 3} className="md:mx-0" />
                <div>Search</div>
              </Link>
              <Link
                to="/chat"
                className={`hover:bg-muted flex gap-2 items-center text-lg p-3 ${
                  pathname === "/chat" ? "bg-muted text-xl font-bold" : ""
                }`}
              >
                <MessageCircle strokeWidth={pathname === "/chat" ? 4 : 2} className="text-2xl md:mx-0" />
                <div>Chats</div>
              </Link>
              <Link
                to="/groups"
                className={`hover:bg-muted flex gap-2 items-center text-lg p-3 ${
                  pathname === "/groups" ? "bg-muted text-xl font-bold" : ""
                }`}
              >
                <FaUsers strokeWidth={pathname === "/groups" ? 4 : 2} className="text-2xl md:mx-0" />
                <div>Groups</div>
              </Link>
              <Link
                to="/communities"
                className={`hover:bg-muted flex gap-2 items-center text-lg p-3 ${
                  pathname === "/communities" ? "bg-muted text-xl font-bold" : ""
                  }`}
              >
                <FaGlobe strokeWidth={pathname === "/communities" ? 4 : 2} className="text-2xl md:mx-0" />
              <div>Communities</div>
              </Link>
              <Link
                to="/livesessions"
                className={`hover:bg-muted flex gap-2 items-center text-lg p-3 ${
                  pathname === "/livesessions" ? "bg-muted text-xl font-bold" : ""
                  }`}
              >
                <FaTv strokeWidth={pathname === "/livesessions" ? 4 : 2} className="text-2xl md:mx-0" />
              <div>Live Sessions</div>
              </Link>
              {/* <Link
                to="/notifications"
                className={`hover:bg-muted flex gap-2 items-center text-lg p-3 ${
                  pathname === "/notifications" ? "bg-muted text-xl font-bold" : ""
                }`}
              >
                <Bell className="md:mx-0" strokeWidth={pathname === "/notifications" ? 4 : 3} />
                <div>Notifications</div>
              </Link> */}
              <Link
                to="/profile"
                className={`hover:bg-muted flex gap-2 items-center text-lg p-3 ${
                  pathname === "/profile" ? "bg-muted text-xl font-bold" : ""
                }`}
              >
                <User className="md:mx-0" strokeWidth={pathname === "/profile" ? 4 : 3} />
                <div>Profile</div>
              </Link>
              <Link
                to="/settings"
                className={`hover:bg-muted flex gap-2 items-center text-lg p-3 ${
                  pathname === "/settings" ? "bg-muted text-xl font-bold" : ""
                }`}
              >
                <Settings className="md:mx-0" strokeWidth={pathname === "/settings" ? 3 : 2} />
                <div>Settings</div>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

export default MobileUserNavbar;
