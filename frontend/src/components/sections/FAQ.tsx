import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
  
function FAQ() {
    return (
      <Accordion type="single" collapsible className="m-5 md:m-10 mt-2 md:mt-3">
        <AccordionItem value="item-1">
          <AccordionTrigger>What is SocialHive?</AccordionTrigger>
          <AccordionContent>
          SocialHive is a platform designed for engineering students to connect, collaborate on projects, and share experiences about their college life. Whether it's group work, project management, or networking, this platform helps students build a supportive and engaged community.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger> Who can join SocialHive?</AccordionTrigger>
          <AccordionContent>
          Currently, SocialHive is open to engineering students across various universities in India. You can join if you&apos;re a student interested in collaborating on projects, sharing experiences, or networking with other students.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3 ">
          <AccordionTrigger className="text-start"> How can I start a group project on SocialHive?</AccordionTrigger>
          <AccordionContent>
          To start a group project, go to the "Groups" section, create a group, and invite your teammates.Then start a project in "Projects" tab and You&apos;ll be able to assign tasks, set deadlines, and keep track of progress within your project group.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger>Can I share insights about my college?</AccordionTrigger>
          <AccordionContent>
          Yes! The platform provides a space to share your college experiences and tips with others. While it&apos;s not an official insight source, it is a great way to help future students get an idea of what your campus is like.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-5">
          <AccordionTrigger>Is there a mobile version of the platform?</AccordionTrigger>
          <AccordionContent>
          The platform is currently optimized for desktop. But you can use it on mobile as well.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-6">
          <AccordionTrigger> How do I report inappropriate content?</AccordionTrigger>
          <AccordionContent>
          If you encounter inappropriate content, please email us the details in the "Help and Support" section. We strive to create a respectful and safe community for everyone.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }
export default FAQ