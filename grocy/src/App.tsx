import { MantineProvider } from "@mantine/core";
import { RouterProvider } from "react-router-dom";
import { routes } from "./util/routes";
import { themeDefault } from "./themes/default";

function App() {
    return (
        <MantineProvider
            forceColorScheme="dark"
            withCssVariables
            theme={themeDefault}
        >
            <RouterProvider router={routes} />
        </MantineProvider>
    );
}

export default App;
