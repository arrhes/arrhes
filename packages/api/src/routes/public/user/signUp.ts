import { pbkdf2Sync } from "node:crypto"
import { generateId, models, signUpRouteDefinition } from "@comptasse/application-metadata"
import { validateBodyMiddleware } from "../../../middlewares/validateBody.middleware.js"
import { getCookieDomainFromHost } from "../../../utilities/cookies/getCookieDomainFromHost.js"
import { serializeCookie } from "../../../utilities/cookies/serializeCookie.js"
import { signString } from "../../../utilities/cookies/signString.js"
import { Exception } from "../../../utilities/exception.js"
import { getRemoteAddress } from "../../../utilities/getRemoteAddress.js"
import { registerRoute } from "../../../utilities/registerRoute.js"
import { response } from "../../../utilities/response.js"
import { insertOne } from "../../../utilities/sql/insertOne.js"
import { getCookieSecurityOptions, productName } from "../../../utilities/variables.js"

export const signUpRoute = registerRoute(signUpRouteDefinition, async (c) => {
    const body = await validateBodyMiddleware({
        context: c,
        schema: signUpRouteDefinition.schemas.body,
    })

    if (body.password !== body.passwordCheck) {
        throw new Exception({
            statusCode: 400,
            internalMessage: "Different passwords",
            externalMessage: "Les mots de passe renseignés sont différents",
        })
    }

    const createUserSession = await c.var.clients.sql.transaction(async (tx) => {
        const passwordSalt = generateId()
        const passwordHash = pbkdf2Sync(body.password, passwordSalt, 128000, 64, "sha512").toString("hex")

        const createUser = await insertOne({
            database: tx,
            table: models.user,
            data: {
                id: generateId(),
                isActive: true,
                alias: null,
                email: body.email,
                passwordHash: passwordHash,
                passwordSalt: passwordSalt,
                createdAt: new Date().toISOString(),
                lastUpdatedAt: null,
            },
        })

        // Store the session
        const createUserSession = await insertOne({
            database: tx,
            table: models.userSession,
            data: {
                id: generateId(),
                idUser: createUser.id,
                isActive: true,
                expiresAt: new Date(Date.now() + c.var.env.USER_SESSION_COOKIE_MAX_AGE * 1000).toISOString(),
                ip: getRemoteAddress({
                    context: c,
                }),
                createdAt: new Date().toISOString(),
                lastUpdatedAt: null,
            },
        })

        return createUserSession
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
        schema: signUpRouteDefinition.schemas.return,
        data: {},
    })
})
