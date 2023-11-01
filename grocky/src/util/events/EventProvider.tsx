import { ReactNode, useEffect, useState } from "react";
import { EventContext } from "./util";
import { useConnectionStatus, useReady } from "../api";

export function EventProvider({
    children,
}: {
    children?: ReactNode | ReactNode[];
}) {
    const [listeners, setListeners] = useState<
        {
            event: string;
            id: string;
            handler: (event: string, data: any) => void;
        }[]
    >([]);

    const ready = useReady();
    const connected = useConnectionStatus();

    useEffect(() => {
        const controller = new AbortController();

        async function runFetch() {
            while (!controller.signal.aborted) {
                try {
                    const result = await fetch("/api/events/", {
                        signal: controller.signal,
                        headers: {
                            Authorization: localStorage.getItem("token") ?? "",
                        },
                    });
                    if (result.ok && result.body) {
                        const reader = result.body.getReader();
                        while (true) {
                            const { done, value } = await reader.read();
                            const data = JSON.parse(
                                new TextDecoder().decode(value),
                            );

                            listeners
                                .filter(
                                    (l) => l.event === "server:" + data.type,
                                )
                                .map((l) =>
                                    l.handler("server:" + data.type, data.data),
                                );

                            if (done || controller.signal.aborted) {
                                break;
                            }
                        }
                    } else {
                        break;
                    }
                } catch {
                    return;
                }
            }
        }

        if (ready && localStorage.getItem("token") && connected) {
            runFetch();
        }

        return () => {
            controller.abort();
        };
    }, [ready, listeners, connected]);

    return (
        <EventContext.Provider
            value={{
                emit: (event, data) =>
                    listeners
                        .filter((l) => l.event === event)
                        .map((l) => l.handler(event, data)),
                listen: (event, handler, id) =>
                    setListeners((current) => [
                        ...current,
                        { event, id, handler },
                    ]),
                removeListener: (id) =>
                    setListeners((current) =>
                        current.filter((l) => l.id !== id),
                    ),
            }}
        >
            {children}
        </EventContext.Provider>
    );
}
