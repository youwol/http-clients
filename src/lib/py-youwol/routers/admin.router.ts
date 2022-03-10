import { Router } from '../../router'
import { WebSocketResponse$ } from '../../ws-utils'
import { CustomCommandsRouter } from './custom-commands/custom-commands.router'
import { EnvironmentRouter } from './environment/environment.router'
import { LocalCdnRouter } from './local-cdn/local-cdn.router'
import { ProjectsRouter } from './projects/projects.router'
import { SystemRouter } from './system/system.router'

export class AdminRouter extends Router {
    public readonly customCommands: CustomCommandsRouter
    public readonly environment: EnvironmentRouter
    public readonly projects: ProjectsRouter
    public readonly system: SystemRouter
    public readonly localCdn: LocalCdnRouter

    constructor(parent: Router, ws$: () => WebSocketResponse$<unknown>) {
        super(parent.headers, `${parent.basePath}/admin`)
        this.customCommands = new CustomCommandsRouter(this)
        this.environment = new EnvironmentRouter(this, ws$)
        this.projects = new ProjectsRouter(this, ws$)
        this.system = new SystemRouter(this)
        this.localCdn = new LocalCdnRouter(this, ws$)
    }
}
