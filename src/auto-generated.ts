
const runTimeDependencies = {
    "load": {
        "rxjs": "^6.5.5"
    },
    "differed": {},
    "includedInBundle": []
}
const externals = {
    "rxjs": "rxjs_APIv6",
    "rxjs/operators": {
        "commonjs": "rxjs/operators",
        "commonjs2": "rxjs/operators",
        "root": [
            "rxjs_APIv6",
            "operators"
        ]
    }
}
export const setup = {
    name:'@youwol/http-clients',
    assetId:'QHlvdXdvbC9odHRwLWNsaWVudHM=',
    version:'1.0.1',
    shortDescription:"The library exposes some of YouWol backend services.",
    developerDocumentation:'https://platform.youwol.com/applications/@youwol/cdn-explorer/latest?package=@youwol/http-clients',
    npmPackage:'https://www.npmjs.com/package/@youwol/http-clients',
    sourceGithub:'https://github.com/youwol/http-clients',
    userGuide:'https://l.youwol.com/doc/@youwol/http-clients',
    apiVersion:'1',
    runTimeDependencies,
    externals
}
