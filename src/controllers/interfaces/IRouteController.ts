import { Router } from "itty-router";

export interface IRouteController {
    initRoutes: (router: Router) => void
}