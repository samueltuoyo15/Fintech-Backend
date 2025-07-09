import mongoose from "mongoose"

const refreshTokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    token: {
        type: String,
        unique: true,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true
    },
}, { timestamps: true })

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema)

export default RefreshToken