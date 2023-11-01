export type GroupType = {
    id: string;
    name: string;
    description: string;
    owner: string;
    members: string[];
};

export function isGroupType(obj: any): obj is GroupType {
    return Object.keys(obj).includes("owner");
}
