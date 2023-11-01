import { createContext, useCallback, useContext, useEffect } from "react";
import { v4 } from "uuid";

export type EventContextType = {
    emit: (event: string, data: any) => void;
    listen: (
        event: string,
        handler: (event: string, data: any) => void,
        id: string,
    ) => void;
    removeListener: (id: string) => void;
};

export const EventContext = createContext<EventContextType>({
    emit: () => {},
    listen: () => {},
    removeListener: () => {},
});

export function useEventEmitter<T = any>(event: string): (data: T) => void {
    const context = useContext(EventContext);
    const emitter = useCallback(
        (data: T) => context.emit(`client:${event}`, data),
        [event],
    );
    return emitter;
}

export function useClientEvent<T = any>(
    event: string,
    listener: (data: T) => void,
): void {
    const context = useContext(EventContext);
    useEffect(() => {
        const id = v4();
        context.listen(`client:${event}`, (_, d) => listener(d), id);
        return () => context.removeListener(id);
    }, [event, listener]);
}

export function useServerEvent<T = any>(
    event: string,
    listener: (data: T) => void,
): void {
    const context = useContext(EventContext);
    useEffect(() => {
        const id = v4();
        context.listen(`server:${event}`, (_, d) => listener(d), id);
        return () => context.removeListener(id);
    }, [event, listener]);
}
