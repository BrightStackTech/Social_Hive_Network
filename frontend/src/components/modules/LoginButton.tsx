import { Button } from '../ui/button'
import { Link } from 'react-router-dom'

const LoginButton = () => {
  return (
    <div>

        <Link to="/login">
            <Button>Login/Register</Button>
        </Link>
    </div>
  )
}

export default LoginButton
