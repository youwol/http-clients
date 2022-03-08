import { Router } from '../../../router'
import { RawDataRouter, RawFluxProjectRouter, RawPackageRouter } from './'
import { RawStoryRouter } from './story'

export class RawRouter extends Router {
    public readonly fluxProject: RawFluxProjectRouter
    public readonly package: RawPackageRouter
    public readonly data: RawDataRouter
    public readonly story: RawStoryRouter

    constructor(parent: Router) {
        super(parent.headers, `${parent.basePath}/raw`)

        this.fluxProject = new RawFluxProjectRouter(this)
        this.package = new RawPackageRouter(this)
        this.data = new RawDataRouter(this)
        this.story = new RawStoryRouter(this)
    }
}
