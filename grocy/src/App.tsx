import { MantineProvider } from "@mantine/core";
import { RouterProvider } from "react-router-dom";
import { routes } from "./util/routes";
import { themeDefault } from "./themes/default";
import { TranslationProvider } from "./util/translation";

function App() {
    return (
        <TranslationProvider>
            <MantineProvider
                forceColorScheme="dark"
                withCssVariables
                theme={themeDefault}
            >
                <RouterProvider router={routes} />
            </MantineProvider>
        </TranslationProvider>
    );
}

export default App;
