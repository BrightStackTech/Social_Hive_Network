import Footer from "@/components/sections/Footer";
import NavBar from "@/components/sections/NavBar"
import { Separator } from "@/components/ui/separator"
import { useEffect } from "react"
import { Link } from "react-router-dom"

function TermsOfService() {
  document.title = "SocialHive - Terms of Service"
    useEffect(() => {
        window.scrollTo(0, 0);
      }, []);
  return (
    <div>
        <NavBar/>
        <div className="m-10">

        <div className="text-2xl font-bold text-center my-4">Terms of Service for SocialHive</div>

<div className="text-lg text-center my-4">
    Welcome to SocialHive, a personal project created to connect students and alumni through shared experiences and stories.
    </div>

<div className="text-lg">1. Acceptance of Terms</div>
By using this platform, you agree to these Terms of Service. This website is provided as a non-commercial, personal project, and the service is offered "as is."

<div className="text-lg">2. User Responsibilities</div>
Users must respect others and engage in polite and constructive discussions.
Harassment, hate speech, or posting inappropriate content will not be tolerated.
Users are responsible for the content they post.
<div className="text-lg">3. Privacy and Data</div>
This website collects limited personal information (such as names, emails) solely to provide the service.
We will not sell or misuse your data.
<div className="text-lg">4. Content Ownership</div>
Users own the content they post and can delete it at any time.
By posting content, you grant this website the right to display and distribute your content within the platform.
<div className="text-lg">5. Limitation of Liability</div>
As this is a personal project, I am not responsible for any downtime, data loss, or issues you may encounter while using this website.

<div className="text-lg">6. Changes to Terms</div>
These terms may change over time, and users will be notified of any updates.

        <div className="text-lg font-semibold">If you have any questions or issues, please contact <Link className="text-blue-500" to={`https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&to=${import.meta.env.VITE_SUPPORT_EMAIL}`}>${import.meta.env.VITE_SUPPORT_EMAIL}</Link></div>
        </div>
        <Separator/>
       <Footer/>

    </div>
  )
}

export default TermsOfService
