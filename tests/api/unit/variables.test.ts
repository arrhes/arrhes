import { describe, expect, it } from "vitest"
import {
    defaultUserSessionCookieMaxAge,
    getCookieSecurityOptions,
    productName,
    storageFileExpiresIn,
    verificationTokenLifetime,
} from "#/utilities/variables.js"

describe("variables", () => {
    describe("constants", () => {
        it("defaultUserSessionCookieMaxAge is 1 year in seconds", () => {
            expect(defaultUserSessionCookieMaxAge).toBe(60 * 60 * 24 * 365)
        })

        it("verificationTokenLifetime is 1 day in milliseconds", () => {
            expect(verificationTokenLifetime).toBe(1000 * 60 * 60 * 24)
        })

        it("storageFileExpiresIn is 1 hour in seconds", () => {
            expect(storageFileExpiresIn).toBe(3600)
        })

        it("productName is 'comptasse'", () => {
            expect(productName).toBe("comptasse")
        })
    })

    describe("getCookieSecurityOptions", () => {
        it("returns secure + SameSite=None in production", () => {
            const options = getCookieSecurityOptions("production")
            expect(options).toEqual({
                secure: true,
                sameSite: "None",
            })
        })

        it("returns insecure + SameSite=Lax in development", () => {
            const options = getCookieSecurityOptions("development")
            expect(options).toEqual({
                secure: false,
                sameSite: "Lax",
            })
        })

        it("returns insecure + SameSite=Lax for unknown environments", () => {
            const options = getCookieSecurityOptions("staging")
            expect(options).toEqual({
                secure: false,
                sameSite: "Lax",
            })
        })
    })
})
