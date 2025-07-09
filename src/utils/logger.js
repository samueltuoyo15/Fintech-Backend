import pino from "pino"

const logger = pino({
    level: process.env.NODE_ENV === "productino" ? "info" : "debug",
    ...process.env.NODE_ENV !== "production" && {
        transport: {
            target: "pino-pretty",
            optinos: {
                colorize: true
            }
        }
    }
})

export default logger