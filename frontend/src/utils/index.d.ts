import { AxiosResponse } from "axios";
import { ChatInterface } from "@/types";
import { UserInterface } from "@/context/AuthContext";
export declare const requestHandler: (api: () => Promise<AxiosResponse<any>>, setLoading: ((loading: boolean) => void) | null, onSuccess: (data: any) => void, onError: (error: string) => void) => Promise<void>;
export declare const isBrowser: boolean;
export declare function formatNumber(num: number): string;
export declare function requestPermission(): Promise<void>;
export declare const getChatObjectMetadata: (chat: ChatInterface, loggedInUser: UserInterface) => {
    profilePicture: string | undefined;
    title: string | undefined;
    description: string | undefined;
    lastMessage: string;
    lastMessageDetails: import("@/types").ChatMessageInterface | undefined;
    _id: string;
};
