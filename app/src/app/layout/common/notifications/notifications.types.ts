    export interface Notification
    {
        id: number;
        icon?: string;
        image?: string;
        title?: string;
        description?: string;
        time: string;
        link?: string;
        useRouter?: boolean;
        read: boolean;
    }
