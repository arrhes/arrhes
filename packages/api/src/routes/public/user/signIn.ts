import { pbkdf2Sync } from "node:crypto"
import { generateId, models, signInRouteDefinition } from "@comptasse/application-metadata"
import { eq } from "drizzle-orm"
import { validateBodyMiddleware } from "../../../middlewares/validateBody.middleware.js"
import { getCookieDomainFromHost } from "../../../utilities/cookies/getCookieDomainFromHost.js"
import { serializeCookie } from "../../../utilities/cookies/serializeCookie.js"
import { signString } from "../../../utilities/cookies/signString.js"
import { Exception } from "../../../utilities/exception.js"
import { getRemoteAddress } from "../../../utilities/getRemoteAddress.js"
import { registerRoute } from "../../../utilities/registerRoute.js"
import { response } from "../../../utilities/response.js"
import { insertOne } from "../../../utilities/sql/insertOne.js"
import { selectOne } from "../../../utilities/sql/selectOne.js"
import { getCookieSecurityOptions, productName } from "../../../utilities/variables.js"

export const signInRoute = registerRoute(signInRouteDefinition, async (c) => {
    const body = await validateBodyMiddleware({
        context: c,
        schema: signInRouteDefinition.schemas.body,
    })

    const user = await selectOne({
        database: c.var.clients.sql,
        table: models.user,
        where: (table) => eq(table.email, body.email.trim().toLowerCase()),
    })

    const passwordHash = pbkdf2Sync(body.password, user.passwordSalt, 128000, 64, "sha512").toString("hex")
    if (passwordHash !== user.passwordHash) {
        throw new Exception({
            statusCode: 400,
            internalMessage: "Error signing in",
            externalMessage: "Identifiants incorrects",
            cause: "Password does not match the database one",
        })
    }

    // Store the session
    const createUserSession = await insertOne({
        database: c.var.clients.sql,
        table: models.userSession,
        data: {
            id: generateId(),
            idUser: user.id,
            isActive: true,
            expiresAt: new Date(Date.now() + c.var.env.USER_SESSION_COOKIE_MAX_AGE * 1000).toISOString(),
            ip: getRemoteAddress({
                context: c,
            }),
            createdAt: new Date().toISOString(),
            lastUpdatedAt: null,
        },
    })

    // Set cookies
    const cookieSecurity = getCookieSecurityOptions(c.var.env.ENV)
    const cookieDomain = getCookieDomainFromHost({
        hostHeader: c.req.header("host"),
        fallbackDomain: c.var.env.COOKIES_DOMAIN,
    })
    c.res.headers.append(
        "Set-Cookie",
        serializeCookie({
            name: `${productName}_${"id_user_session"}`,
            value: signString({
                value: createUserSession.id,
                secret: c.var.env.COOKIES_KEY,
            }),
            options: {
                maxAge: c.var.env.USER_SESSION_COOKIE_MAX_AGE,
                httpOnly: true,
                ...cookieSecurity,
                domain: cookieDomain,
                path: "/",
            },
        }),
    )
    c.res.headers.append(
        "Set-Cookie",
        serializeCookie({
            name: `${productName}_${"is_auth"}`,
            value: String(true),
            options: {
                maxAge: c.var.env.USER_SESSION_COOKIE_MAX_AGE,
                httpOnly: false,
                ...cookieSecurity,
                domain: cookieDomain,
                path: "/",
            },
        }),
    )

    return response({
        context: c,
        statusCode: 200,
        schema: signInRouteDefinition.schemas.return,
        data: {},
    })
})
