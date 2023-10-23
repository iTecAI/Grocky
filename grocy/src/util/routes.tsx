import { createBrowserRouter } from "react-router-dom";
import { Layout } from "../views/layout/Layout";

export const routes = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [],
    },
]);
