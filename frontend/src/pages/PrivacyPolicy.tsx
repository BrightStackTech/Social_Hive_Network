import Footer from "@/components/sections/Footer";
import NavBar from "@/components/sections/NavBar";
import { useEffect } from "react";

const PrivacyPolicy = () => {
    useEffect(()=>{
      document.title = "SocialHive - Privacy Policy"
        window.scrollTo(0,0)
    }
        ,[]
    )
  return (
    <div>
      <NavBar />
    <div className="m-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Privacy Policy</h1>
      
      <p className="mb-4">
        <strong>Effective Date:</strong> 5/10/2024
      </p>

      <p className="mb-6">
        This Privacy Policy explains how we collect, use, and protect your personal information when you use <strong>SocialHive</strong>. This project is a personal, non-commercial platform designed to help students and alumni share their stories and experiences.
      </p>

      <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
      <p className="mb-4">
        We collect the following types of information:
      </p>
      <ul className="list-disc list-inside mb-6">
        <li><strong>Personal Information:</strong> Basic information such as your name, email address, and profile details.</li>
        <li><strong>Content You Share:</strong> Posts, comments, or reviews shared on the platform.</li>
        <li><strong>Automatically Collected Information:</strong> Information such as your IP address, browser type, and device information to improve functionality.</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
      <p className="mb-6">
        We use your information to manage your account, enable interactions, improve the platform, and send notifications related to website activity.
      </p>

      <h2 className="text-2xl font-semibold mb-4">3. Data Sharing and Disclosure</h2>
      <p className="mb-6">
        We do not sell or share your information, except with your consent or to comply with legal obligations.
      </p>

      <h2 className="text-2xl font-semibold mb-4">4. How We Protect Your Information</h2>
      <p className="mb-6">
        We implement reasonable security measures to protect your data from unauthorized access, though no method is 100% secure.
      </p>

      <h2 className="text-2xl font-semibold mb-4">5. Cookies and Tracking</h2>
      <p className="mb-6">
        We use cookies to ensure the proper functionality of the website and to enhance your user experience. Cookies are small text files stored on your device when you visit our website.
      </p>

      <h3 className="text-xl font-semibold mb-4">5.1 Types of Cookies We Use</h3>
      <ul className="list-disc list-inside mb-6">
        <li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function correctly (e.g., for login sessions).</li>
        <li><strong>Performance Cookies:</strong> These help us understand how you interact with our website to improve functionality (e.g., page loading times).</li>
        <li><strong>Analytics Cookies:</strong> Used to collect anonymous information about website usage for improving user experience.</li>
      </ul>

      <h3 className="text-xl font-semibold mb-4">5.2 Managing Cookies</h3>
      <p className="mb-6">
        You can control or delete cookies through your browser settings. However, please note that disabling essential cookies may impact your ability to use certain features of the website.
      </p>


      <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
      <ul className="list-disc list-inside mb-6">
        <li>Access and update your personal information via account settings.</li>
        <li>Request account deletion and associated data.</li>
        <li>Opt-out of communications such as emails.</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
      <p className="mb-6">
        The website is intended for users 18 and older. We do not knowingly collect information from children.
      </p>

      <h2 className="text-2xl font-semibold mb-4">8. Changes to the Privacy Policy</h2>
      <p className="mb-6">
        We may update this Privacy Policy periodically. Changes will be posted here with the updated "Effective Date."
      </p>

      <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
      <p className="mb-6">
        If you have any questions, feel free to contact us at <strong>${import.meta.env.VITE_SUPPORT_EMAIL}</strong>.
      </p>
    </div>
   <Footer/>

    </div>
  );
};

export default PrivacyPolicy;
