import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
    CardFooter
} from "@/components/ui/card"
import { ModeToggle } from "@/components/mode-toggle"

function Appearance() {
  return (
    <div>
        <Card>
            <CardHeader>
                <CardTitle>
                    Theme
                </CardTitle>
                <CardDescription>
                    Choose the theme of the app
                </CardDescription>
                </CardHeader>
                <CardContent>
                    <ModeToggle/>
                </CardContent>
                <CardFooter>
                    <p>Choose the theme of the app</p>
                </CardFooter>
            
        </Card>
    </div>
  )
}

export default Appearance
