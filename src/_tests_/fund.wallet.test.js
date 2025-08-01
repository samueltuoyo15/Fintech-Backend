import { fundAccount } from "../controllers/payment.controller.js"
import Account from "../models/account.model.js"
import Transaction from "../models/transaction.model.js"
import * as monnifyService from "../services/monnify.service.js"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../models/account.model.js")
vi.mock("../models/transaction.model.js")
vi.mock("../services/monnify.service")

describe("fund-account", () => {
    beforeEach(() => vi.clearAllMocks())
    const mockUser = { _id: "3bf362e821e3b2b4f474b20d8721050fc1a385d4c898fcd070269b5ac9cab275" }

    const req = {
        body: {
            email: "tuoyosamuel9082@gmail.com",
            amount: 100000
        },
        user: mockUser
    }

    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
    }

    it("should return 400 if email or amount is missing", async () => {
        const badReq = { ...req, body: { email: null, amount: null }}
        await fundAccount(badReq, res)
        expect(res.status).toHaveBeenCalledWith(400)
    })

    it("should return 400 if amount the user want to fund is less than 100", async () => {
        const badReq = { ...req, body: { email: "tuoyosamuel9082@gmail.com", amount: 50 }}
        await fundAccount(badReq, res)
        expect(res.status).toHaveBeenCalledWith(400)
    })

    it("should return 404 if account is not found", async () => {
        Account.findOne.mockResolvedValue(null)
        await fundAccount(req, res)
        expect(Account.findOne).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(404)
    })

    it("should initialize Monnify transaction with create DB entry", async () => {
        const mockAccount = {
            transactions: [],
            save: vi.fn()
        }

        const mockResponse = {
            responseBody: {
                checkoutUrl: "https://monnify.com/checkout/abc123"
            }
        }

        Account.findOne.mockResolvedValue(mockAccount)
        monnifyService.initializeTransaction.mockResolvedValue(mockResponse)
        Transaction.create.mockResolvedValue({ _id: "txn123"})

        await fundAccount(req, res)

        expect(monnifyService.initializeTransaction).toHaveBeenCalled
        expect(Transaction.create).toHaveBeenCalled()
        expect(mockAccount.save).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "Transaction initialized. Please complete payment.",
            checkoutUrl: expect.any(String),
            reference: expect.any(String)
        }))
    })
})