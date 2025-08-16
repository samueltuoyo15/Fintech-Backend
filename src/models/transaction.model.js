import mongoose from "mongoose"

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["data", "recharge-card-pin", "bulk_sms", "airtime-2-cash", "airtime", "electricity", "cable", "funding", "result-checker", "referral"],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending"
  },
  reference: {
    type: String,
    unique: true,
    required: true
  }
}, { timestamps: true })

transactionSchema.index({ user: 1, type: 1, createdAt: -1 })
transactionSchema.index({ reference: 1 }, { unique: true })

const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema)

export default Transaction
