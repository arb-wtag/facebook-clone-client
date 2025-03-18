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
        }
      ]
    },
]);

export default router;