export type Session = {
    id: string;
    last_request: string;
    user: User | null;
};

export type User = {
    id: string;
    username: string;
    display_name: string;
    profile_image: string | null;
};