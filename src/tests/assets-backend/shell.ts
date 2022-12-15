import '../mock-requests'
import { expectAttributes, Shell } from '../common'
import {
    AddFilesResponse,
    AddImageResponse,
    CreateAssetBody,
    DeleteAccessPolicyResponse,
    DeleteAssetResponse,
    DeleteFilesResponse,
    GetAccessPolicyResponse,
    GetAssetResponse,
    GetHealthzResponse,
    GetPermissionsResponse,
    QueryAccessInfoResponse,
    RemoveImageResponse,
    UpdateAssetBody,
    UpdateAssetResponse,
    UpsertAccessPolicyBody,
    UpsertAccessPolicyResponse,
} from '../../lib/assets-backend'
import { HTTPError, wrap } from '@youwol/http-primitives'
import { readFileSync } from 'fs'
import { NewAssetResponse } from '../../lib/assets-gateway'

function newShellFromContext<TContext, TResp>(
    shell: Shell<TContext>,
    resp: TResp,
    newContext?: (s: Shell<TContext>, r: TResp) => TContext,
) {
    return newContext
        ? new Shell({ ...shell, context: newContext(shell, resp) })
        : shell
}

function expectAsset(resp: unknown) {
    expectAttributes(resp, [
        'assetId',
        'kind',
        'rawId',
        'name',
        'images',
        'thumbnails',
        'tags',
        'description',
        'groupId',
    ])
}

export function healthz<TContext>({
    newContext,
    authorizedErrors,
    sideEffects,
}: {
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp, shell: Shell<TContext>) => void
    newContext?: (shell: Shell<TContext>, resp: GetHealthzResponse) => TContext
} = {}) {
    return wrap<Shell<TContext>, GetHealthzResponse>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.assets.getHealthz$(),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            expect(resp.status).toBe('assets-backend ok')
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
}

export function createAsset<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => { body: CreateAssetBody }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp, shell: Shell<TContext>) => void
    newContext?: (
        shell: Shell<TContext>,
        resp: NewAssetResponse<Record<string, never>>,
    ) => TContext
}) {
    return wrap<Shell<TContext>, GetAssetResponse>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.assets.createAsset$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            expectAsset(resp)
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
}

export function accessInfo<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => { assetId: string }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp, shell: Shell<TContext>) => void
    newContext?: (
        shell: Shell<TContext>,
        resp: QueryAccessInfoResponse,
    ) => TContext
}) {
    return wrap<Shell<TContext>, QueryAccessInfoResponse>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.assets.queryAccessInfo$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            expectAttributes(resp, ['owningGroup', 'consumerInfo'])
            expectAttributes(resp.owningGroup, ['name', 'groupId'])
            expectAttributes(resp.consumerInfo, ['permissions'])
            expectAttributes(resp.consumerInfo.permissions, [
                'write',
                'read',
                'share',
            ])
            if (resp.ownerInfo) {
                expectAttributes(resp.ownerInfo, [
                    'exposingGroups',
                    'defaultAccess',
                ])
                expectAttributes(resp.ownerInfo.defaultAccess, [
                    'read',
                    'share',
                ])
            }
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
}

export function updateAsset<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => {
        assetId: string
        body: UpdateAssetBody
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp, shell: Shell<TContext>) => void
    newContext?: (shell: Shell<TContext>, resp: UpdateAssetResponse) => TContext
}) {
    return wrap<Shell<TContext>, UpdateAssetResponse>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.assets.updateAsset$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            expectAsset(resp)
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
}

export function getAsset<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => {
        assetId: string
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp, shell: Shell<TContext>) => void
    newContext?: (shell: Shell<TContext>, resp: GetAssetResponse) => TContext
}) {
    return wrap<Shell<TContext>, GetAssetResponse>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.assets.getAsset$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            expectAsset(resp)
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
}

export function upsertAccessPolicy<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => {
        assetId: string
        groupId: string
        body: UpsertAccessPolicyBody
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp, shell: Shell<TContext>) => void
    newContext?: (
        shell: Shell<TContext>,
        resp: UpsertAccessPolicyResponse,
    ) => TContext
}) {
    return wrap<Shell<TContext>, UpsertAccessPolicyResponse>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.assets.upsertAccessPolicy$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
}

export function getAccessPolicy<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => {
        assetId: string
        groupId: string
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp, shell: Shell<TContext>) => void
    newContext?: (
        shell: Shell<TContext>,
        resp: GetAccessPolicyResponse,
    ) => TContext
}) {
    return wrap<Shell<TContext>, GetAccessPolicyResponse>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.assets.getAccessPolicy$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            expectAttributes(resp, ['read', 'share', 'parameters'])
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
}

export function deleteAccessPolicy<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => {
        assetId: string
        groupId: string
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (
        resp: DeleteAccessPolicyResponse,
        shell: Shell<TContext>,
    ) => void
    newContext?: (
        shell: Shell<TContext>,
        resp: DeleteAccessPolicyResponse,
    ) => TContext
}) {
    return wrap<Shell<TContext>, DeleteAccessPolicyResponse>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.assets.deleteAccessPolicy$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
}

export function getPermissions<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => {
        assetId: string
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp: GetPermissionsResponse, shell: Shell<TContext>) => void
    newContext?: (
        shell: Shell<TContext>,
        resp: GetPermissionsResponse,
    ) => TContext
}) {
    return wrap<Shell<TContext>, GetPermissionsResponse>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.assets.getPermissions$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            expectAttributes(resp, ['write', 'read', 'share'])
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
}

export function addImage<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => {
        assetId: string
        path: string
        filename: string
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp: AddImageResponse, shell: Shell<TContext>) => void
    newContext?: (shell: Shell<TContext>, resp: AddImageResponse) => TContext
}) {
    return wrap<Shell<TContext>, AddImageResponse>({
        observable: (shell: Shell<TContext>) => {
            const { path } = inputs(shell)
            const buffer = readFileSync(path)
            const content = new Blob([Uint8Array.from(buffer).buffer])
            return shell.assetsGtw.assets.addImage$({
                ...inputs(shell),
                body: {
                    content,
                },
            })
        },
        authorizedErrors,
        sideEffects: (resp, shell) => {
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
}

export function addFiles<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => {
        assetId: string
        path: string
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp: AddFilesResponse, shell: Shell<TContext>) => void
    newContext?: (shell: Shell<TContext>, resp: AddFilesResponse) => TContext
}) {
    return wrap<Shell<TContext>, AddFilesResponse>({
        observable: (shell: Shell<TContext>) => {
            const { path } = inputs(shell)
            const buffer = readFileSync(path)
            const content = new Blob([Uint8Array.from(buffer).buffer])
            return shell.assetsGtw.assets.addZipFiles$({
                ...inputs(shell),
                body: {
                    content,
                },
            })
        },
        authorizedErrors,
        sideEffects: (resp, shell) => {
            expectAttributes(resp, ['filesCount', 'totalBytes'])
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
}

export function getFile<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => {
        assetId: string
        path: string
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp, shell: Shell<TContext>) => void
    newContext?: (shell: Shell<TContext>, resp: Blob) => TContext
}) {
    return wrap<Shell<TContext>, Blob>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.assets.getFile$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            // expect instanceOf Blob not working
            // Most likely because there are multiple constructors of Blob available,
            // and different are used
            expect(resp).toBeTruthy()
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
}

export function zipAllFiles<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => {
        assetId: string
        path: string
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp: Blob, shell: Shell<TContext>) => void
    newContext?: (shell: Shell<TContext>, resp: Blob) => TContext
}) {
    return wrap<Shell<TContext>, Blob>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.assets.getZipFiles$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            // expect instanceOf Blob not working
            // Most likely because there are multiple constructors of Blob available,
            // and different are used
            expect(resp).toBeTruthy()
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
}

export function deleteFiles<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => {
        assetId: string
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp: DeleteFilesResponse, shell: Shell<TContext>) => void
    newContext?: (shell: Shell<TContext>, resp: DeleteFilesResponse) => TContext
}) {
    return wrap<Shell<TContext>, DeleteFilesResponse>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.assets.deleteFiles$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            // expect instanceOf Blob not working
            // Most likely because there are multiple constructors of Blob available,
            // and different are used
            expect(resp).toBeTruthy()
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
}

export function removeImage<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => {
        assetId: string
        filename: string
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp: RemoveImageResponse, shell: Shell<TContext>) => void
    newContext?: (shell: Shell<TContext>, resp: RemoveImageResponse) => TContext
}) {
    return wrap<Shell<TContext>, RemoveImageResponse>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.assets.removeImage$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
}

export function getMedia<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => {
        assetId: string
        mediaType: 'images' | 'thumbnails'
        filename: string
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp, shell: Shell<TContext>) => void
    newContext?: (shell: Shell<TContext>, resp: Blob) => TContext
}) {
    return wrap<Shell<TContext>, Blob>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.assets.getMedia$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            // expect instanceOf Blob not working
            // Most likely because there are multiple constructors of Blob available,
            // and different are used
            expect(resp.constructor.name).toBe('Blob')
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
}

export function deleteAsset<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => {
        assetId: string
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp: DeleteAssetResponse, shell: Shell<TContext>) => void
    newContext?: (shell: Shell<TContext>, resp: DeleteAssetResponse) => TContext
}) {
    return wrap<Shell<TContext>, DeleteAssetResponse>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.assets.deleteAsset$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
}
