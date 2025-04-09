import { Card,
    CardTitle,
    CardDescription,
    CardHeader,
    CardContent,
    CardFooter
 } from "@/components/ui/card"
 import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import FAQ from "@/components/sections/FAQ"
function HelpAndSupport() {
  return (
    <div className="grid h-[60vh] md:h-[90vh] overflow-auto scrollbar-hide gap-5">

      <Card>
        <CardHeader>
          <CardTitle>Help and Support</CardTitle>
          <CardDescription>
            Get help with any of our features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We're here to help. If you have any questions, please reach out
            to us via email at ${import.meta.env.VITE_SUPPORT_EMAIL}. We will get back to you as soon as possible.
          </p>
        </CardContent>
        <CardFooter>
           <Link to={`https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&to=${import.meta.env.VITE_SUPPORT_EMAIL}&su=Requesting%20Support`} target="_blank"> <Button >Mail us</Button></Link>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Feedback</CardTitle>
          <CardDescription>
            Share your feedback with us
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We're always looking for ways to improve our product. Please let us
            know what you think. We appreciate your feedback!
          </p>
        </CardContent>
        
        <CardFooter>
           <Link to={`https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&to=${import.meta.env.VITE_SUPPORT_EMAIL}&su=Feedback%20For%20The%20Social%20Hive%20Network`} target="_blank"> <Button >Mail us</Button></Link>
        </CardFooter>
      </Card>
      <FAQ/>
    </div>
  )
}

export default HelpAndSupport
