import { createContext, useState } from 'react';
import { useAuth, useClerk, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
    const [credit, setCredit] = useState(0);
    const [image, setImage] = useState(null);
    const [resultImage, setResultImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const { isSignedIn } = useUser();
    const { openSignIn } = useClerk();

    const loadCreditsData = async () => {
        try {
            const token = await getToken();
            
            const { data } = await axios.get(`${backendUrl}/api/user/credits`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (data.success) {
                setCredit(data.credits);
            }
        } catch (error) {
            console.error("Credits loading error:", error);
            toast.error(error?.response?.data?.message || "Failed to load credits");
        }
    };

    const removeBg = async (image) => {
        try {
            if (!isSignedIn) {
                openSignIn();
                return;
            }
            if (!image) {
                toast.error("Please select an image");
                return;
            }

            setIsLoading(true);
            setImage(image);
            setResultImage(null);
            navigate('/result');

            const token = await getToken();
            const formData = new FormData();
            formData.append('image', image);

            const { data } = await axios.post(
                `${backendUrl}/api/image/remove-bg`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (data.success) {
                setResultImage(data.resultImage);
                setCredit(data.creditBalance);
                toast.success(data.message);
            } else {
                if (data.creditBalance === 0) {
                    // Show the toast message first
                    toast.error(data.message);
                    // Wait for the toast to be displayed before navigation
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    navigate('/buy');
                } else {
                    toast.error(data.message);
                    data.creditBalance && setCredit(data.creditBalance);
                }
            }
        } catch (error) {
            console.error("Remove BG Error:", error);
            toast.error(error?.response?.data?.message || "Failed to remove background");
            if (error?.response?.status === 401) {
                openSignIn();
            }
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        credit,
        setCredit,
        loadCreditsData,
        backendUrl,
        image,
        setImage,
        removeBg,
        isLoading,
        resultImage,
        setResultImage,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;  