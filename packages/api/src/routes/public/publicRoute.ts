import { apiFactory } from "../../utilities/apiFactory.js"
import { readAllRoutesRoute } from "./readAllRoutes.js"
import { resetPasswordRoute } from "./user/resetPassword.js"
import { signInRoute } from "./user/signIn.js"
import { signOutRoute } from "./user/signOut.js"
import { signUpRoute } from "./user/signUp.js"

export const publicRoute = apiFactory
    .createApp()
    .route("/", readAllRoutesRoute)
    .route("/", signInRoute)
    .route("/", signUpRoute)
    .route("/", signOutRoute)
    .route("/", resetPasswordRoute)
