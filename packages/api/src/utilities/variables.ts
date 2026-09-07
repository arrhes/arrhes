export const defaultUserSessionCookieMaxAge = 60 * 60 * 24 * 365

export const verificationTokenLifetime = 1000 * 60 * 60 * 24 * 1

export const storageFileExpiresIn = 60 * 60

export const productName = "comptasse"

/**
 * Returns cookie security options based on the environment.
 * - Production: secure + SameSite=None (requires HTTPS, allows cross-site)
 * - Development: no secure flag + SameSite=Lax (works over HTTP)
 */
export function getCookieSecurityOptions(env: string): {
    secure: boolean
    sameSite: "Strict" | "Lax" | "None"
} {
    if (env === "production") {
        return {
            secure: true,
            sameSite: "None",
        }
    }
    return {
        secure: false,
        sameSite: "Lax",
    }
}
