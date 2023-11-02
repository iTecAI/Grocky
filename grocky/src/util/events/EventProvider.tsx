import { ReactNode, useCallback, useEffect, useState } from "react";
import { EventContext } from "./util";
import { useSession } from "../api";

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

    const session = useSession();
    const emit = useCallback(
        (event: string, data: any) =>
            listeners
                .filter((l) => l.event === event)
                .map((l) => l.handler(event, data)),
        [listeners],
    );

    useEffect(() => {
        if (session) {
            const socket = new WebSocket(
                `${location.protocol === "http:" ? "ws" : "wss"}://${
                    location.host
                }/api/events/ws.${session.id}`,
            );
            socket.addEventListener(
                "message",
                (event: MessageEvent<string>) => {
                    const parsed = JSON.parse(event.data);
                    emit("server:" + parsed.event, parsed.data);
                },
            );

            return () => socket.close(1000, "sessionUpdate");
        }
    }, [session, emit]);

    return (
        <EventContext.Provider
            value={{
                emit,
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
