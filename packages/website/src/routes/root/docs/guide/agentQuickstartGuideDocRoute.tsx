import { createRoute } from "@tanstack/react-router"
import { AgentQuickstartGuideDocPage } from "../../../../features/docs/guide/AgentQuickstartGuideDocPage.js"
import { guideDocLayoutRoute } from "./guideDocLayoutRoute.js"

export const agentQuickstartGuideDocRoute = createRoute({
    getParentRoute: () => guideDocLayoutRoute,
    path: "/agent/démarrer",
    beforeLoad: () => ({
        title: "Démarrer avec l'API (agents)",
        description: "Authentification, conventions, scénarios comptables et documentation Markdown pour agents IA.",
    }),
    component: () => <AgentQuickstartGuideDocPage />,
})
