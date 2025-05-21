import {BrowserRouter,Route,Routes} from 'react-router-dom'
import Main from '../Pages/Main'
import AuthPage from '../Pages/LoginSignUp'

function App() {
  return(
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<AuthPage/>}/>
        <Route path='/chat' element={<Main/>}/>
      </Routes>
    </BrowserRouter>
    
  )
  
}

export default App
