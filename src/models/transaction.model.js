import mongoose from "mongoose"

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["data", "airtime", "electricity", "cable", "funding", "referral"],
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

const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema)

export default Transaction
