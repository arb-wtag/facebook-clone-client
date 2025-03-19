import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import Root from "./root";
import ErrorPage from "./ErrorPage";
import Login from "./Login";
import Register from "./Register";
import Groups from "./Groups";
import Profile from "./Profile";
import Inbox from "./Inbox";
import Friend from "./Friend";
import Home from "./Home";

const router = createBrowserRouter([
    {
      path: "/",
      element: <Root></Root>,
      errorElement: <ErrorPage></ErrorPage>,
      children: [
        {
          path: '/login',
          element: <Login></Login>
        },
        {
          path: '/register',
          element: <Register></Register>
        },
        {
          path: '/groups',
          element: <Groups></Groups>
        },
        {
          path: '/profile',
          element: <Profile></Profile>
        },
        {
          path: '/inbox',
          element: <Inbox></Inbox>
        },
        {
          path: '/friend',
          element: <Friend></Friend>
        },
        {
          path: '/',
          element: <Home></Home>
        }
      ]
    },
]);

export default router;