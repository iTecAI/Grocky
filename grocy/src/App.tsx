import { MantineProvider } from "@mantine/core";
import { RouterProvider } from "react-router-dom";
import { routes } from "./util/routes";

function App() {
    return (
        <MantineProvider forceColorScheme="dark" withCssVariables>
            <RouterProvider router={routes} />
        </MantineProvider>
    );
}

export default App;
