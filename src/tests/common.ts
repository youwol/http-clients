import {RootRouter} from "../lib/router";
import {PyYouwolClient} from "../lib/py-youwol";

RootRouter.HostName = getPyYouwolBasePath()
RootRouter.Headers = {'py-youwol-local-only': 'true'}

export function getPyYouwolBasePath() {
    return "http://localhost:2001"
}

export function resetPyYouwolDbs$() {
    return new PyYouwolClient().admin.customCommands.doGet$('reset')
}


export function expectAttributes(resp, attributes: Array<string | [string, any]>) {

    attributes.forEach((att) => {
        if (Array.isArray(att)){
            if(resp[att[0]] == undefined)
                console.log(`expected field '${att[0]}' not found`)
            expect(resp[att[0]]).toEqual(att[1])
        }
        else{
            if(resp[att]==undefined)
                console.log(`expected field '${att}' not found`)
            expect(resp[att] != undefined).toBeTruthy()
        }
    })
}
