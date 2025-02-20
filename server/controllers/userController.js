import { Webhook } from 'svix';
import { Buffer } from 'buffer';
import userModel from '../models/userModel.js';

const clerkWebhooks = async (req, res) => {
    try {
        const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
        
        // Get the headers
        const svix_id = req.headers["svix-id"];
        const svix_timestamp = req.headers["svix-timestamp"];
        const svix_signature = req.headers["svix-signature"];
        
        // If there are no headers, error out
        if (!svix_id || !svix_timestamp || !svix_signature) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required Svix headers" 
            });
        }
        
        // Get the body as text
        const payload = JSON.stringify(req.body);
        const body = Buffer.from(payload);
        
        // Create a new Svix instance with your secret
        const wh = new Webhook(WEBHOOK_SECRET);
        
        let evt;
        try {
            evt = wh.verify(body, {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            });
        } catch (err) {
            console.error("Webhook verification failed:", err);
            return res.status(400).json({ 
                success: false, 
                message: "Webhook verification failed" 
            });
        }
        
        const { data, type } = evt;
        
        switch (type) {
            case "user.created": {
                const userData = {
                    clerkId: data.id,
                    emailId: data.email_addresses[0].email_address,
                    firstName: data.first_name || "",
                    lastName: data.last_name || "",
                    photo: data.image_url || "https://placeholder.com/user"
                };
                
                await userModel.create(userData);
                return res.status(201).json({ 
                    success: true, 
                    message: "User Created" 
                });
            }
            
            case "user.updated": {
                const userData = {
                    emailId: data.email_addresses[0].email_address,
                    firstName: data.first_name || "",
                    lastName: data.last_name || "",
                    photo: data.image_url || "https://placeholder.com/user"
                };
                
                const updatedUser = await userModel.findOneAndUpdate(
                    { clerkId: data.id },
                    userData,
                    { new: true }
                );
                
                if (!updatedUser) {
                    return res.status(404).json({ 
                        success: false, 
                        message: "User not found" 
                    });
                }
                
                return res.json({ 
                    success: true, 
                    message: "User Updated" 
                });
            }
            
            case "user.deleted": {
                const deletedUser = await userModel.findOneAndDelete({ 
                    clerkId: data.id 
                });
                
                if (!deletedUser) {
                    return res.status(404).json({ 
                        success: false, 
                        message: "User not found" 
                    });
                }
                
                return res.json({ 
                    success: true, 
                    message: "User Deleted" 
                });
            }
            
            default:
                return res.status(400).json({ 
                    success: false, 
                    message: "Unhandled event type" 
                });
        }
        
    } catch (error) {
        console.error("Webhook Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

export { clerkWebhooks };

// import { Webhook } from 'svix';
// import userModel from '../models/userModel.js';

// // API Controller function to manage Clerk users with database
// // Endpoint: http://localhost:4000/api/user/webhooks
// const clerkWebhooks = async (req, res) => {
//     try {
//         // Create a Svix instance with Clerk webhook secret.
//         const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

//         await whook.verify(JSON.stringify(req.body), {
//             "svix-id": req.headers["svix-id"],
//             "svix-timestamp": req.headers["svix-timestamp"],
//             "svix-signature": req.headers["svix-signature"]
//         });

//         const { data, type } = req.body;

//         switch (type) {
//             case "user.created": {
//                 const userData = {
//                     clerkId: data.id,
//                     emailId: data.email_addresses[0].email_address, 
//                     firstName: data.first_name,
//                     lastName: data.last_name,
//                     photo: data.image_url
//                 };

//                 await userModel.create(userData);
//                 res.status(201).json({ success: true, message: "User Created" });

//                 break;
//             }

//             case "user.updated": {
//                 const userData = {
//                     emailId: data.email_addresses[0].email_address, // Correct field name
//                     firstName: data.first_name,
//                     lastName: data.last_name,
//                     photo: data.image_url
//                 };

//                 await userModel.findOneAndUpdate({ clerkId: data.id }, userData);
//                 res.json({ success: true, message: "User Updated" });

//                 break;
//             }

//             case "user.deleted": {
//                 const deletedUser = await userModel.findOneAndDelete({ clerkId: data.id });

//                 if (deletedUser) {
//                     res.json({ success: true, message: "User Deleted" });
//                 } else {
//                     res.status(404).json({ success: false, message: "User Not Found" });
//                 }

//                 break;
//             }

//             default:
//                 res.status(400).json({ success: false, message: "Unhandled event type" });
//         }
        
//     } catch (error) {
//         console.error("Webhook Error:", error.message);
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// export { clerkWebhooks };
