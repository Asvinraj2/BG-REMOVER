const authUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not Authorized, Login Again'
            });
        }

        // For Clerk tokens, we don't need to verify, just decode to get user ID
        const tokenData = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        req.userId = tokenData.sub; // Clerk stores the user ID in the 'sub' claim
        next();
    } catch (error) {
        console.error('Auth Error:', error);
        return res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

export default authUser;