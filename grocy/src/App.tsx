import { MantineProvider } from "@mantine/core";
import { RouterProvider } from "react-router-dom";
import { routes } from "./util/routes";
import { themeDefault } from "./themes/default";
import { TranslationProvider } from "./util/translation";
import { ApiProvider } from "./util/api";
import { ModalsProvider } from "@mantine/modals";
import { MODALS } from "./views/modals";

function App() {
    return (
        <TranslationProvider>
            <MantineProvider
                forceColorScheme="dark"
                withCssVariables
                theme={themeDefault}
            >
                <ApiProvider>
                    <ModalsProvider
                        modals={MODALS}
                        modalProps={{ withCloseButton: true }}
                    >
                        <RouterProvider router={routes} />
                    </ModalsProvider>
                </ApiProvider>
            </MantineProvider>
        </TranslationProvider>
    );
}

export default App;
