import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
// import { requestPermission } from '@/utils'


const SetLogin = () => {
  const navigate = useNavigate()
  const { getGoogleSignedInUser } = useAuth()
  const queryParameters = new URLSearchParams(window.location.search)
  const accessToken = queryParameters.get('access-token')
  useEffect(() => {
    if (accessToken) {
      localStorage.setItem('token', accessToken)
      getGoogleSignedInUser({accessToken})
      // requestPermission().then(() => {
      navigate('/profile')
      // })
    }
  }, [])
  return (
    <div>
      
    </div>
  )
}

export default SetLogin
