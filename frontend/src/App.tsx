import LandingPage from './components/sections/LandingPage'
import Login from './pages/Login'
import SetLogin from './pages/SetLogin'
import {Route, Routes} from 'react-router-dom'
import RegisterForm from './pages/Register'
import Profile from './pages/Profile'
import PrivateRoute from './pages/PrivateRoute'
import PublicRoute from './pages/PublicRoute'
import EditProfile from './pages/EditProfile'
import ExplorePosts from './pages/ExplorePosts'
import SearchPage from './pages/SearchPage'
import OtherUserProfile from './pages/OtherUserProfile'
import AddPersonalDetails from './pages/AddPersonalDetails'
import PostComments from './pages/PostComments'
import Groups from './pages/Groups'
import GroupIdPage from './pages/GroupIdPage'
import ProjectIdPage from './pages/ProjectIdPage'
import { messaging } from './firebase/firebaseConfig'
import {onMessage } from 'firebase/messaging'
import {toast} from 'react-toastify'
import ProjectEdit from './pages/ProjectEdit'
import Settings from './pages/Settings'
import GeneralLayout from './components/GeneralLayout'
import GroupView from './pages/GroupView'
import TermsOfService from './pages/TermsOfService'
import AboutTheSite from './pages/AboutTheSite'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Chat from './pages/Chat'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import SendVerificationEmail from './pages/SendVerificationEmail'
import CommunitiesPage from './pages/CommunitiesPage'
import LiveSessions from './pages/LiveSessions'
import NotFound from './pages/NotFound';
import CommunityProfilePage from './pages/CommunityProfilePage';
import CommunityNotFound from './pages/CommunityNotFound';
import EditCommunityProfile from './pages/EditCommunityProfile';
import CheckComPost from './pages/CheckComPost';
import ComSearchPage from './pages/ComSearchPage';
import CheckUserUpdatePage from './pages/CheckUserUpdatePage';
import LiveSessionsHistory from "./pages/LiveSessionsHistory";
// import CreateSessionScreen from "./components/CreateSessionScreen.jsx";
// import JoinSessionScreen from "./components/JoinSessionScreen.jsx";
import ProfileAnalytics from './pages/ProfileAnalytics';
import CategoryPage from './pages/CategoryPage';

function App() {
  // const {user, token} = useAuth()
  onMessage(messaging, (payload) => {
    toast.info(
      <div>
        <p>{payload.notification?.title}</p>
        <p>{payload.notification?.body}</p>

      </div>,
      {toastId:payload.notification?.title} 
    )
  });

  

  
  return (
    <div>
      <Routes>
        <Route path='/about-the-site' element={<AboutTheSite/>}/>
        <Route element={<PublicRoute/>}>

        <Route path='/' element={<LandingPage/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/setLogin' element={<SetLogin/>}/>
        <Route path='/register' element={<RegisterForm/>}/>
        <Route path='/terms-of-service' element={<TermsOfService/>}/>
        <Route path='/privacy-policy' element={<PrivacyPolicy/>}/>
        <Route path='/forgot-password' element={<ForgotPassword/>}/>
        </Route>
        <Route element={<PrivateRoute>
          
        </PrivateRoute>}>
          <Route path='/profile' element={<Profile/>}/>
        <Route path='/editProfile' element={<EditProfile/>}/>
        <Route path='/explore' element={<ExplorePosts/>}/>
        <Route path='/search' element={<SearchPage/>}/>
        <Route path='/user/:username' element={<OtherUserProfile/>}/>
        <Route path='/add-personal-details' element={<AddPersonalDetails/>}/>
        <Route path='/post/:postId' element={<PostComments/>}/>
        <Route path='/groups' element={<Groups/>}/>
        <Route path='/groups/:groupId' element={<GroupIdPage/>}/>
        <Route path='/projects/:projectId' element={<ProjectIdPage/>}/>
        <Route path='/projects/:projectId/edit' element={<ProjectEdit/>}/>
        <Route path='/send-email-verification' element={<SendVerificationEmail/>}/>
        <Route element={<GeneralLayout/>}>
        <Route path='/settings' element={<Settings/>}/>
        <Route path='/groupview/:groupId/' element={<GroupView/>}/>
            <Route path='/chat' element={<Chat />} />
            <Route path='/chat/:username' element={<Chat />} />
            <Route path='/chat/:username/share' element={<Chat />} />
            <Route path='/communities' element={<CommunitiesPage />} />
            <Route path='/communities/c/:communityName' element={<CommunityProfilePage />} />
            <Route path="/communities/not-found" element={<CommunityNotFound />} />
            <Route path="/communities/c/:communityName/edit" element={<EditCommunityProfile />} />
            <Route path="/compost/:id" element={<CheckComPost />} />
            <Route path='/livesessions' element={<LiveSessions />} />
        </Route>
        </Route>
        <Route path='/mail-verification/:token' element={<VerifyEmail/>}/>
        <Route path='/reset-password/:token' element={<ResetPassword/>}/>
        <Route path='*' element={<NotFound />} />
        <Route path='/communities/c/*' element={<CommunityNotFound />} />
        <Route path='/com-search' element={<ComSearchPage />} />
        <Route path="/user/:userId/updates" element={<CheckUserUpdatePage />} />
        <Route path="/livesessions/history" element={<LiveSessionsHistory />} />
        {/* <Route path="/livesessions/create-session" element={<CreateSessionScreen />} />
        <Route path="/livesessions/join-session" element={<JoinSessionScreen />} />  */}
        <Route path="/profile-analytics" element={<ProfileAnalytics />} />
        <Route path="/category/:categoryId" element={<CategoryPage />} />
      </Routes>
      
    </div>
  )
}
 

export default App
