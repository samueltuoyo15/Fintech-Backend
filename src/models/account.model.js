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
    account_number: {
        type: String,
        default: null
    },
    account_name: {
        type: String,
        default: null
    },
    bank_name: {
        type: String,
        default: null
    },
    referral_link: {
        type: String,
        default: null
    },
    transactions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction"
    }],
}, { timestamps: true})

const Account = mongoose.models.Account || mongoose.model("Account", accountSchema)

export default Account