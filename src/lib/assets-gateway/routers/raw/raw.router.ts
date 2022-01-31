import { Router } from '../../../router';
import { DataRouter } from './data';
import { FluxProjectRouter } from './flux-project';
import { PackageRouter } from './package';


export class RawRouter extends Router {

    static dedicatedPathDomain = "raw"

    public readonly fluxProject: FluxProjectRouter
    public readonly package: PackageRouter
    public readonly data: DataRouter

    constructor(parent: Router) {
        super(parent.headers, `${parent.basePath}/raw`)

        this.fluxProject = new FluxProjectRouter(this)
        this.package = new PackageRouter(this)
        this.data = new DataRouter(this)
    }
}
