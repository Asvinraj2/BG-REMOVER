import { Webhook } from 'svix';
import userModel from '../models/userModel.js';

// API Controller function to manage Clerk users with database
// Endpoint: http://localhost:4000/api/user/webhooks
const clerkWebhooks = async (req, res) => {
    try {
        // Create a Svix instance with Clerk webhook secret.
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        await whook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        });

        const { data, type } = req.body;

        switch (type) {
            case "user.created": {
                const userData = {
                    clerkId: data.id,
                    emailId: data.email_addresses[0].email_address, 
                    firstName: data.first_name,
                    lastName: data.last_name,
                    photo: data.image_url
                };

                await userModel.create(userData);
                res.status(201).json({ success: true, message: "User Created" });

                break;
            }

            case "user.updated": {
                const userData = {
                    emailId: data.email_addresses[0].email_address, // Correct field name
                    firstName: data.first_name,
                    lastName: data.last_name,
                    photo: data.image_url
                };

                await userModel.findOneAndUpdate({ clerkId: data.id }, userData);
                res.json({ success: true, message: "User Updated" });

                break;
            }

            case "user.deleted": {
                const deletedUser = await userModel.findOneAndDelete({ clerkId: data.id });

                if (deletedUser) {
                    res.json({ success: true, message: "User Deleted" });
                } else {
                    res.status(404).json({ success: false, message: "User Not Found" });
                }

                break;
            }

            default:
                res.status(400).json({ success: false, message: "Unhandled event type" });
        }
        
    } catch (error) {
        console.error("Webhook Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { clerkWebhooks };
