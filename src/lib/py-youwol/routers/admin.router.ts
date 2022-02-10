/** @format */

import { Router } from '../../router'
import { EnvironmentRouter } from './environment/environment.router'
import { CustomCommandsRouter } from './custom-commands/custom-commands.router'
import { ProjectsRouter } from './projects/projects.router'
import { ContextMessage$ } from '../../ws-utils'

export class AdminRouter extends Router {
    public readonly customCommands: CustomCommandsRouter
    public readonly environment: EnvironmentRouter
    public readonly projects: ProjectsRouter

    constructor(parent: Router, ws$: () => ContextMessage$<unknown>) {
        super(parent.headers, `${parent.basePath}/admin`)
        this.customCommands = new CustomCommandsRouter(this)
        this.environment = new EnvironmentRouter(this, ws$)
        this.projects = new ProjectsRouter(this, ws$)
    }
}
