
const runTimeDependencies = {
    "externals": {
        "@youwol/http-primitives": "^0.2.0",
        "rxjs": "^7.5.6"
    },
    "includedInBundle": {}
}
const externals = {
    "@youwol/http-primitives": {
        "commonjs": "@youwol/http-primitives",
        "commonjs2": "@youwol/http-primitives",
        "root": "@youwol/http-primitives_APIv02"
    },
    "rxjs": {
        "commonjs": "rxjs",
        "commonjs2": "rxjs",
        "root": "rxjs_APIv7"
    },
    "rxjs/operators": {
        "commonjs": "rxjs/operators",
        "commonjs2": "rxjs/operators",
        "root": [
            "rxjs_APIv7",
            "operators"
        ]
    }
}
const exportedSymbols = {
    "@youwol/http-primitives": {
        "apiKey": "02",
        "exportedSymbol": "@youwol/http-primitives"
    },
    "rxjs": {
        "apiKey": "7",
        "exportedSymbol": "rxjs"
    }
}

const mainEntry : {entryFile: string,loadDependencies:string[]} = {
    "entryFile": "./index.ts",
    "loadDependencies": [
        "rxjs",
        "@youwol/http-primitives"
    ]
}

const secondaryEntries : {[k:string]:{entryFile: string, name: string, loadDependencies:string[]}}= {}

const entries = {
     '@youwol/http-clients': './index.ts',
    ...Object.values(secondaryEntries).reduce( (acc,e) => ({...acc, [`@youwol/http-clients/${e.name}`]:e.entryFile}), {})
}
export const setup = {
    name:'@youwol/http-clients',
        assetId:'QHlvdXdvbC9odHRwLWNsaWVudHM=',
    version:'3.0.2-wip',
    shortDescription:"The library exposes some of YouWol backend services.",
    developerDocumentation:'https://platform.youwol.com/applications/@youwol/cdn-explorer/latest?package=@youwol/http-clients&tab=doc',
    npmPackage:'https://www.npmjs.com/package/@youwol/http-clients',
    sourceGithub:'https://github.com/youwol/http-clients',
    userGuide:'https://l.youwol.com/doc/@youwol/http-clients',
    apiVersion:'3',
    runTimeDependencies,
    externals,
    exportedSymbols,
    entries,
    secondaryEntries,
    getDependencySymbolExported: (module:string) => {
        return `${exportedSymbols[module].exportedSymbol}_APIv${exportedSymbols[module].apiKey}`
    },

    installMainModule: ({cdnClient, installParameters}:{
        cdnClient:{install:(unknown) => Promise<WindowOrWorkerGlobalScope>},
        installParameters?
    }) => {
        const parameters = installParameters || {}
        const scripts = parameters.scripts || []
        const modules = [
            ...(parameters.modules || []),
            ...mainEntry.loadDependencies.map( d => `${d}#${runTimeDependencies.externals[d]}`)
        ]
        return cdnClient.install({
            ...parameters,
            modules,
            scripts,
        }).then(() => {
            return window[`@youwol/http-clients_APIv3`]
        })
    },
    installAuxiliaryModule: ({name, cdnClient, installParameters}:{
        name: string,
        cdnClient:{install:(unknown) => Promise<WindowOrWorkerGlobalScope>},
        installParameters?
    }) => {
        const entry = secondaryEntries[name]
        if(!entry){
            throw Error(`Can not find the secondary entry '${name}'. Referenced in template.py?`)
        }
        const parameters = installParameters || {}
        const scripts = [
            ...(parameters.scripts || []),
            `@youwol/http-clients#3.0.2-wip~dist/@youwol/http-clients/${entry.name}.js`
        ]
        const modules = [
            ...(parameters.modules || []),
            ...entry.loadDependencies.map( d => `${d}#${runTimeDependencies.externals[d]}`)
        ]
        return cdnClient.install({
            ...parameters,
            modules,
            scripts,
        }).then(() => {
            return window[`@youwol/http-clients/${entry.name}_APIv3`]
        })
    },
    getCdnDependencies(name?: string){
        if(name && !secondaryEntries[name]){
            throw Error(`Can not find the secondary entry '${name}'. Referenced in template.py?`)
        }
        const deps = name ? secondaryEntries[name].loadDependencies : mainEntry.loadDependencies

        return deps.map( d => `${d}#${runTimeDependencies.externals[d]}`)
    }
}
