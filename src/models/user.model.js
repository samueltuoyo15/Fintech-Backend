import mongoose from "mongoose"
import * as argon2 from "argon2"

const userSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true,
        trim: true
    },
    avatar: {
        type: String,
        default: null
    },
    account: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Account"
    },
    last_login: {
        type: Date,
        default: null
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        requried: true
    },
    password: {
        type: String,
        required: true,
        select: false
    }, 
    is_verified: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
})

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    try {
        const hash = await argon2.hash(this.password)
        this.password = hash
        next()
    } catch (error) {
        next(error)
    }
})

userSchema.methods.comparePassword = async function (password) {
    try {
        return await argon2.verify(this.password, password)
    } catch (error) {
        throw new Error("Password comparison failed")
    }
}

userSchema.index({ email: true })
userSchema.index({ username: true })

const User = mongoose.model("User", userSchema)

export default User