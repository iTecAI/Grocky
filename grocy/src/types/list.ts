export type ListType = {
    id: string;
    name: string;
    description: string;
    owned_by: string;
} & (
    | {
          type: "general";
          options: Record<string, never>;
      }
    | {
          type: "task";
          options: Record<string, never>;
      }
    | {
          type: "grocery";
          options: {
              stores: string[];
          };
      }
);

export function isListType(obj: any): obj is ListType {
    return Object.keys(obj).includes("owned_by");
}
