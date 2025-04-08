import Footer from "@/components/sections/Footer";
import NavBar from "@/components/sections/NavBar";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";
const AboutTheSite = () => {
    useEffect(() => {
        document.title = "SocialHive - About the site"
        window.scrollTo(0, 0)
    },[])
  return (
    <div>
        <NavBar/>
    <div className="m-10">
      <h2 className="text-3xl font-semibold mb-4">How to Use SocialHive</h2>

      <p className="mb-4">
        Welcome to <span className="font-bold">SocialHive</span>, a platform designed to connect college students and alumni. Here’s a quick guide to help you make the most of your experience:
      </p>

      <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-2">1. Create Your Profile</h3>
        <p className="mb-2">Sign up using your email or social media account. Customize your profile by adding details such as your college, engineering domain. Don't forget to add a profile picture and bio to stand out!</p>
      </div>

      <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-2">2. Join or Create Groups</h3>
        <p className="mb-2">
          <strong>Explore Groups:</strong> Browse groups related to your college, engineering domain, or other interests. 
        </p>
        <p className="mb-2">
          <strong>Create a Group:</strong> Start your own group, invite friends, and engage in discussions.
        </p>
        <p className="mb-2">
          <strong>Group Features:</strong> Collaborate on projects, share posts, and start discussions.
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-2">3. Post & Share</h3>
        <p className="mb-2">
          Share your stories, reviews, and experiences. Follow your feed to stay updated with posts from users you follow.
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-2">4. Connect & Network</h3>
        <p className="mb-2">
          Follow other users to see their updates, collaborate on projects, and stay engaged by liking, commenting, and sharing posts.
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-2">5. Notifications</h3>
        <p className="mb-2">Get notified when someone follows you, comments on your posts, or when groups you're in have new activity.</p>
      </div>

      <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-2">6. Search for Content</h3>
        <p className="mb-2">
          Use the search bar to find posts, users, and groups. Filter by tags, college, or engineering domain for more specific results.
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-2">7. Customize Your Experience</h3>
        <p className="mb-2">
          Visit the <strong>Settings</strong> page to adjust account settings.
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-2">8. Need Help?</h3>
        <p className="mb-2">
          Visit our <strong>Help & Support</strong> section or contact us directly if you have any questions.
        </p>
      </div>

      <p className="font-semibold">Start posting, joining groups, and building your network today!</p>
    </div>
    <Separator/>
    <Footer/>
    </div>
  );
};

export default AboutTheSite;
