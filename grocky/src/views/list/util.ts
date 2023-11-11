import { ReactNode } from "react";
import { ListItem, ListType } from "../../types/list";

export type ViewingInfo = {
    body: ReactNode;
    data: ListItem;
    onClose: () => void;
};

export type LayoutProps = {
    list: ListType;
    items: ListItem[];
    children?: ReactNode | ReactNode[];
    viewing: ViewingInfo | null;
};
