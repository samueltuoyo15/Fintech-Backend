import mongoose from "mongoose"

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    wallet_balance: {
        type: Number,
        default: 0
    },
    total_funding: {
        type: Number,
        default: 0
    },
    total_referral: {
        type: Number,
        default: 0
    },
    total_referral_bonus: {
        type: Number,
        default: 0
    },
    wallet_summary: {
        type: Object,
        default: {}
    },
    transactions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction"
    }],
}, { timestamps: true})

const Account = mongoose.model("Account", accountSchema)

export default Account