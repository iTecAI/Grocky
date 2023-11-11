export type GroceryStoreType = "wegmans" | "costco";

export type ListOwnerType = {
    type: "group" | "list";
    id: string;
};

export type ListType = {
    id: string;
    name: string;
    description: string;
    owned_by: ListOwnerType;
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

export type GroceryRatings = {
    average: number;
    count: number;
};

export type GroceryItem = {
    type: GroceryStoreType;
    id: string;
    name: string;
    location: string | null;
    images: string[];
    tags: string[];
    categories: string[];
    price: number;
    ratings: GroceryRatings;
    metadata: { [key: string]: any };
};

export type LinkedGroceryItem = {
    last_update: string;
    linked: boolean;
    item: GroceryItem;
};

interface GenericListItem {
    id: string;
    list_id: string;
    parent_id: string | null;
    added_by: string;
    checked: boolean;
    image: string | null;
    title: string;
    notes: string;
}

export interface GeneralListItemType extends GenericListItem {
    type: "general";
}

export interface GroceryListItemType extends GenericListItem {
    type: "grocery";
    linked: null | LinkedGroceryItem;
    quantity: number;
}

export interface TaskListItemType extends GenericListItem {
    type: "task";
    assigned_to: string[];
    deadline: null | number;
}

export type ListItem =
    | GeneralListItemType
    | GroceryListItemType
    | TaskListItemType;
