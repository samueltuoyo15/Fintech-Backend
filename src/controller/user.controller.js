import User from "../models/user.model.js"
import { redis } from "../config/redis.config.js"

const getUserDetails = async (req, res) => {
    const userId = req?.user._id
    if(!userId) {
        return res.status(400).json({ success: false, message: "User ID is required" })
    }
    try {
        const cachedUser = await redis.get(`user:${userId}`)
        if(cachedUser){
            return res.status(200).json({ success: true, message: "User details retrieved succesfully", source: "redis-cache", user: JSON.parse(cachedUser)})
        }
        
        const user = await User.findById(userId).populate({
            path: "account",
            populate: {
                path: "transactions"
            }
        })

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        await redis.set(`user:${userId}`, JSON.stringify(user), "EX", 300)
        return res.status(200).json({ success: true, message: "User details retrieved successfully", source: "database", user })
    } catch(error){
        console.error("Error retrieving user details:", error)
        res.status(500).json({ sucess: false, message: "Internal server error" })
    }
}

export { getUserDetails}
