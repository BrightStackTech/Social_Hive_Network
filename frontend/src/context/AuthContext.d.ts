import React from "react";
export interface UserInterface {
    _id: string;
    profilePicture: string;
    username: string;
    bio: string;
    phone: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    followers: string[];
    following: string[];
    college: string;
    engineeringDomain: string;
    yearOfGraduation: string;
    isEmailVerified: boolean;
    token: string;
}
declare const AuthContext: React.Context<{
    user: UserInterface | null;
    token: string | null;
    login: (data: {
        email: string | null;
        username: string | null;
        password: string;
    }) => Promise<void>;
    register: (data: FormData) => Promise<void>;
    logout: () => Promise<void>;
    getGoogleSignedInUser: ({ accessToken }: any) => Promise<void>;
    updateAccDetails: (data: {
        username: string | null;
        email: string | null;
        bio: string | null;
    }) => Promise<void>;
    updatePersonalDetails: (data: {
        phone: string | null;
        engineeringDomain: string | null;
        college: string | null;
        yearOfGraduation: string | null;
    }) => Promise<void>;
    updatePFP: (data: FormData) => Promise<void>;
    authError: string | null;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    followOrUnfollowUser: (userId: string) => Promise<void>;
    following: string[];
    setUser: (user: UserInterface | null) => void;
    setAuthError: (authError: string | null) => void;
}>;
declare const useAuth: () => {
    user: UserInterface | null;
    token: string | null;
    login: (data: {
        email: string | null;
        username: string | null;
        password: string;
    }) => Promise<void>;
    register: (data: FormData) => Promise<void>;
    logout: () => Promise<void>;
    getGoogleSignedInUser: ({ accessToken }: any) => Promise<void>;
    updateAccDetails: (data: {
        username: string | null;
        email: string | null;
        bio: string | null;
    }) => Promise<void>;
    updatePersonalDetails: (data: {
        phone: string | null;
        engineeringDomain: string | null;
        college: string | null;
        yearOfGraduation: string | null;
    }) => Promise<void>;
    updatePFP: (data: FormData) => Promise<void>;
    authError: string | null;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    followOrUnfollowUser: (userId: string) => Promise<void>;
    following: string[];
    setUser: (user: UserInterface | null) => void;
    setAuthError: (authError: string | null) => void;
};
declare const AuthProvider: React.FC<{
    children: React.ReactNode;
}>;
export { AuthContext, AuthProvider, useAuth };
