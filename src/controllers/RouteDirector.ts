import { Router } from 'itty-router'
import { IRouteController } from './interfaces/IRouteController'

export class RouteDirector {
    constructor(
        private readonly _router: Router,
        private readonly _controllers: IRouteController[]
    ) {
        
    }

    buildRouter = () => {
        this._controllers.forEach(controller => {
            controller.initRoutes(this._router)
        })
        return this._router
    }
}
