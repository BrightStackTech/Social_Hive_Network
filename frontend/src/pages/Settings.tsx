
import AccountSettings from "@/components/modules/Settings/AccountSettings"
import HelpAndSupport from "@/components/modules/Settings/HelpAndSupport"
import Appearance from "@/components/modules/Settings/Appearance"
import { useState,useRef } from "react"
import MobileUserNavbar from "@/components/sections/MobileUserNavbar"


export default function Settings() {
  document.title = "SocialHive - Settings"
  const [selectedTab, setSelectedTab] = useState("Accounts")
  const scrollableDiv = useRef<HTMLDivElement>(null);
  return (
    <div className="flex h-screen w-full md:w-3/4 flex-col">
     <MobileUserNavbar scrollableDiv={scrollableDiv}/>
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div  className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
          <nav
            className="grid gap-4 text-sm text-muted-foreground" x-chunk="dashboard-04-chunk-0"
          >
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="text-3xl font-semibold">Settings</h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-1 md:flex-col gap-3">

            <div onClick={()=>setSelectedTab("Accounts")}  className={`cursor-pointer ${selectedTab == "Accounts"?"font-semibold text-primary":""}`}>
              Account
            </div>
            <div 
            onClick={()=>setSelectedTab("Help and Support")}
            className={`cursor-pointer ${selectedTab == "Help and Support"?"font-semibold text-primary":""}`}
            >Help and Support</div>
            <div 
            onClick={()=>setSelectedTab("Appearance")}
            className={`cursor-pointer ${selectedTab == "Appearance"?"font-semibold text-primary":""}`}>Appearance</div>
        </div>
          </nav>
     {   selectedTab == "Accounts" &&  <AccountSettings/>}
     {   selectedTab == "Help and Support" &&  <HelpAndSupport/>}
     {   selectedTab == "Appearance" &&  <Appearance/>}
        </div>
      </main>
    </div>
  )
}
