import { Navigate, Route, Routes } from "react-router";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { useEffect } from "react";
import { checkAuth } from "./authSlice";
import {useDispatch,useSelector} from "react-redux";
import AdminPanel from "./pages/AdminPanel";
import ProblemPage from "./pages/ProblemPage";
import Admin from "./pages/Admin";
import AdminDelete from "./pages/AdminDelete";
import AdminVideo from "./components/AdminVideo";
import AdminUpload from "./components/AdminUpload";
import DailyProblem from "./pages/DailyProblem";

function App(){
  const dispatch=useDispatch();
  
 const {isAuthenticated,loading,user}=useSelector((state)=>state.auth);
  useEffect(()=>{
  dispatch(checkAuth())
  },[dispatch]);

    if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }
  return (

    
  <Routes>
  <Route path="/" element={isAuthenticated?<Home></Home>:<Navigate to="/signup"/>}></Route>
  <Route path="/signup" element={isAuthenticated?<Navigate to='/'/>:<Signup></Signup>}></Route>
  <Route path="/login" element={isAuthenticated?<Navigate to="/"/>:<Login></Login> }></Route>
  <Route path="/admin"  element={isAuthenticated && user?.role === 'admin' ? <Admin /> : <Navigate to="/" />}></Route> 
  <Route path="problem/:problemId" element={<ProblemPage />} />
  <Route path="/daily" element={isAuthenticated ? <DailyProblem /> : <Navigate to="/signup" />} />
   <Route path="/admin/create"element={isAuthenticated && user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />}></Route>
   <Route path="/admin/delete" element={isAuthenticated && user?.role === 'admin' ? <AdminDelete /> : <Navigate to="/" />}></Route>
   <Route path="/admin/video" element={isAuthenticated && user?.role === 'admin' ? <AdminVideo /> : <Navigate to="/" />} />
   <Route path="/admin/upload/:problemId" element={isAuthenticated && user?.role === 'admin' ? <AdminUpload /> : <Navigate to="/" />} />
  </Routes>
  )
}
export default App;
