import React from 'react';
export interface Category {
    _id: string;
    name: string;
    description: string;
    imageUrl?: string;
    createdAt?: string;
    createdBy?: {
        _id: string;
        username: string;
        profilePicture: string;
    };
}
interface CategoryCardProps {
    category: Category;
    onClick?: () => void;
}
export declare const CategoryCard: React.FC<CategoryCardProps>;
export default CategoryCard;
