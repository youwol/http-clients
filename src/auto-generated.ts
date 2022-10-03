
const runTimeDependencies = {
    "externals": {
        "rxjs": "^6.5.5",
        "@youwol/http-primitives": "^0.1.1"
    },
    "includedInBundle": {}
}
const externals = {
    "rxjs": {
        "commonjs": "rxjs",
        "commonjs2": "rxjs",
        "root": "rxjs_APIv6"
    },
    "@youwol/http-primitives": {
        "commonjs": "@youwol/http-primitives",
        "commonjs2": "@youwol/http-primitives",
        "root": "@youwol/http-primitives_APIv01"
    },
    "rxjs/operators": {
        "commonjs": "rxjs/operators",
        "commonjs2": "rxjs/operators",
        "root": [
            "rxjs_APIv6",
            "operators"
        ]
    }
}
const exportedSymbols = {
    "rxjs": {
        "apiKey": "6",
        "exportedSymbol": "rxjs"
    },
    "@youwol/http-primitives": {
        "apiKey": "01",
        "exportedSymbol": "@youwol/http-primitives"
    }
}

// eslint-disable-next-line @typescript-eslint/ban-types -- allow to allow no secondary entries
const mainEntry : Object = {
    "entryFile": "./index.ts",
    "loadDependencies": [
        "rxjs"
    ]
}

// eslint-disable-next-line @typescript-eslint/ban-types -- allow to allow no secondary entries
const secondaryEntries : Object = {}
const entries = {
     '@youwol/http-clients': './index.ts',
    ...Object.values(secondaryEntries).reduce( (acc,e) => ({...acc, [`@youwol/http-clients/${e.name}`]:e.entryFile}), {})
}
export const setup = {
    name:'@youwol/http-clients',
        assetId:'QHlvdXdvbC9odHRwLWNsaWVudHM=',
    version:'2.0.0',
    shortDescription:"The library exposes some of YouWol backend services.",
    developerDocumentation:'https://platform.youwol.com/applications/@youwol/cdn-explorer/latest?package=@youwol/http-clients',
    npmPackage:'https://www.npmjs.com/package/@youwol/http-clients',
    sourceGithub:'https://github.com/youwol/http-clients',
    userGuide:'https://l.youwol.com/doc/@youwol/http-clients',
    apiVersion:'2',
    runTimeDependencies,
    externals,
    exportedSymbols,
    entries,
    getDependencySymbolExported: (module:string) => {
        return `${exportedSymbols[module].exportedSymbol}_APIv${exportedSymbols[module].apiKey}`
    },

    installMainModule: ({cdnClient, installParameters}:{cdnClient, installParameters?}) => {
        const parameters = installParameters || {}
        const scripts = parameters.scripts || []
        const modules = [
            ...(parameters.modules || []),
            ...mainEntry['loadDependencies'].map( d => `${d}#${runTimeDependencies.externals[d]}`)
        ]
        return cdnClient.install({
            ...parameters,
            modules,
            scripts,
        }).then(() => {
            return window[`@youwol/http-clients_APIv2`]
        })
    },
    installAuxiliaryModule: ({name, cdnClient, installParameters}:{name: string, cdnClient, installParameters?}) => {
        const entry = secondaryEntries[name]
        const parameters = installParameters || {}
        const scripts = [
            ...(parameters.scripts || []),
            `@youwol/http-clients#2.0.0~dist/@youwol/http-clients/${entry.name}.js`
        ]
        const modules = [
            ...(parameters.modules || []),
            ...entry.loadDependencies.map( d => `${d}#${runTimeDependencies.externals[d]}`)
        ]
        if(!entry){
            throw Error(`Can not find the secondary entry '${name}'. Referenced in template.py?`)
        }
        return cdnClient.install({
            ...parameters,
            modules,
            scripts,
        }).then(() => {
            return window[`@youwol/http-clients/${entry.name}_APIv2`]
        })
    }
}
