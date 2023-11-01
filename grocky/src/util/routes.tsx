import { createBrowserRouter } from "react-router-dom";
import { Layout } from "../views/layout/Layout";
import { IndexView } from "../views/index/Index";

export const routes = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "/",
                element: <IndexView />,
            },
        ],
    },
]);
