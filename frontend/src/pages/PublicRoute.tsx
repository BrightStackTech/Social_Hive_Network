import { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Loader from '@/components/Loader';

function PublicRoute() {
    const { user, isLoading } = useAuth();
    const location = useLocation();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            setIsReady(true);
        }
    }, [isLoading]);

    if (!isReady) {
        return <Loader/> // or a loading spinner
    }

    if (user) {
        // If user is authenticated, redirect to the intended page or default to profile
        const state = location.state as { from?: string };
        const intendedPath = state?.from || '/profile';
        return <Navigate to={intendedPath} replace />;
    }

    return <Outlet />;
}

export default PublicRoute;
