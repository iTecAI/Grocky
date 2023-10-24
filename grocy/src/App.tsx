import { MantineProvider } from "@mantine/core";
import { RouterProvider } from "react-router-dom";
import { routes } from "./util/routes";
import { themeDefault } from "./themes/default";
import { TranslationProvider } from "./util/translation";
import { ApiProvider } from "./util/api/ApiProvider";

function App() {
    return (
        <TranslationProvider>
            <MantineProvider
                forceColorScheme="dark"
                withCssVariables
                theme={themeDefault}
            >
                <ApiProvider>
                    <RouterProvider router={routes} />
                </ApiProvider>
            </MantineProvider>
        </TranslationProvider>
    );
}

export default App;
