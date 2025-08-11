import { fundAccount } from "../controllers/payment.controller.js"
import Account from "../models/account.model.js"
import Transaction from "../models/transaction.model.js"
import initializeTransaction from "../services/paystack.service.js"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../models/account.model.js")
vi.mock("../models/transaction.model.js")
vi.mock("../services/paystack.service.js")

describe("fund-account", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockUser = { _id: "user123" }
  const req = {
    body: {
      email: "test@gmail.com",
      amount: 100000
    },
    user: mockUser
  }
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn()
  }

  it("should initialize transaction successfully", async () => {
    const mockAccount = {
      transactions: [],
      save: vi.fn().mockResolvedValue(true)
    }
    Account.findOne.mockResolvedValue(mockAccount)
    Transaction.create.mockResolvedValue({ _id: "txn123" })
    initializeTransaction.mockResolvedValue({
      data: {
        authorization_url: "https://checkout.paystack.com/abc123",
        reference: "ref_123"
      }
    })

    await fundAccount(req, res)

    expect(initializeTransaction).toHaveBeenCalledWith({
      amount: 100000,
      customerEmail: "test@gmail.com",
      paymentReference: expect.stringContaining("REF_"),
      paymentDescription: "Wallet Funding",
      redirectUrl: expect.stringContaining("/dashboard")
    })
    expect(Transaction.create).toHaveBeenCalled()
    expect(mockAccount.save).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      message: "Transaction initialized. Please complete payment.",
      checkoutUrl: "https://checkout.paystack.com/abc123",
      reference: expect.stringContaining("REF_")
    })
  })

  it("should handle Paystack API errors", async () => {
    const mockAccount = {
      transactions: [],
      save: vi.fn()
    }
    Account.findOne.mockResolvedValue(mockAccount)
    initializeTransaction.mockRejectedValue(new Error("API error"))

    await fundAccount(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Internal server error"
    })
  })
})
