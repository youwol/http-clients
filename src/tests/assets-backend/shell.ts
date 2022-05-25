import '../mock-requests'
import { expectAttributes, Shell, wrap } from '../common'
import {
    AddImageResponse,
    CreateAssetBody,
    CreateAssetResponse,
    DeleteAccessPolicyResponse,
    DeleteAssetResponse,
    GetAccessPolicyResponse,
    GetAssetResponse,
    GetHealthzResponse,
    GetPermissionsResponse,
    QueryAccessInfoResponse,
    RemoveImageResponse,
    UpdateAssetBody,
    UpdateAssetResponse,
    UpsertAccessPolicyResponse,
} from '../../lib/assets-backend'
import { HTTPError } from '../../lib'
import { readFileSync } from 'fs'

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
    return wrap<Shell<TContext>, GetHealthzResponse, TContext>({
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
    newContext?: (shell: Shell<TContext>, resp: CreateAssetResponse) => TContext
}) {
    return wrap<Shell<TContext>, GetAssetResponse, TContext>({
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
    return wrap<Shell<TContext>, QueryAccessInfoResponse, TContext>({
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
    return wrap<Shell<TContext>, UpdateAssetResponse, TContext>({
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
    return wrap<Shell<TContext>, GetAssetResponse, TContext>({
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
        body
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp, shell: Shell<TContext>) => void
    newContext?: (
        shell: Shell<TContext>,
        resp: UpsertAccessPolicyResponse,
    ) => TContext
}) {
    return wrap<Shell<TContext>, UpsertAccessPolicyResponse, TContext>({
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
    return wrap<Shell<TContext>, GetAccessPolicyResponse, TContext>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.assets.getAccessPolicy$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            expectAttributes(resp, ['read', 'share', 'parameters', 'timestamp'])
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
    return wrap<Shell<TContext>, DeleteAccessPolicyResponse, TContext>({
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
    return wrap<Shell<TContext>, GetPermissionsResponse, TContext>({
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
    return wrap<Shell<TContext>, AddImageResponse, TContext>({
        observable: (shell: Shell<TContext>) => {
            const { path } = inputs(shell)
            const buffer = readFileSync(path)
            const content = new Blob([Uint8Array.from(buffer).buffer])
            return shell.assetsGtw.assets.addImage({
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
    return wrap<Shell<TContext>, RemoveImageResponse, TContext>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.assets.removeImage(inputs(shell)),
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
    return wrap<Shell<TContext>, Blob, TContext>({
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
    return wrap<Shell<TContext>, DeleteAssetResponse, TContext>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.assets.deleteAsset$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
}
