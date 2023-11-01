export type ListType = {
    id: string;
    name: string;
    description: string;
    owned_by: string;
    type: "grocery" | "task" | "general";
};

export function isListType(obj: any): obj is ListType {
    return Object.keys(obj).includes("owned_by");
}
