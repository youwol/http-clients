import {
    CallerRequestOptions,
    Empty,
    HTTPResponse$,
    RootRouter,
} from '@youwol/http-primitives'
import { SessionDetails } from './interfaces'

export class AccountsClient extends RootRouter {
    constructor({
        headers,
        basePath,
        hostName,
    }: {
        headers?: { [_key: string]: string }
        basePath?: string
        hostName?: string
    } = {}) {
        super({
            basePath: basePath || '/api/accounts',
            headers,
            hostName,
        })
    }

    public logoutAndForgetUserUrl(redirectUri: string): string {
        return this._logoutUrl(redirectUri, true)
    }

    public logoutUrl(redirectUri: string): string {
        return this._logoutUrl(redirectUri, false)
    }

    private _logoutUrl(redirectUri: string, forget_user: boolean): string {
        return `${this.basePath}/openid_rp/logout?target_uri=${encodeURI(
            redirectUri,
        )}${forget_user ? '&forget_me=true' : ''}`
    }

    public loginAsUserUrl(redirectUri: string): string {
        return `${
            this.basePath
        }/openid_rp/login?flow=user&target_uri=${encodeURI(redirectUri)}`
    }

    public loginAsTempUserUrl(redirectUri: string): string {
        return `${
            this.basePath
        }/openid_rp/login?flow=temp&target_uri=${encodeURI(redirectUri)}`
    }

    public sendRegisterMail$(
        details: { email: string; target_uri: string },
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Empty> {
        return this.send$({
            command: 'create',
            path: '/registration',
            nativeRequestOptions: {
                json: details,
            },
            callerOptions,
        })
    }

    public startVisibleImpersonation$(
        userNameOrId: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Empty> {
        return this._startImpersonation$(userNameOrId, false, callerOptions)
    }

    public startHiddenImpersonation$(
        userNameOrId: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Empty> {
        return this._startImpersonation$(userNameOrId, true, callerOptions)
    }

    private _startImpersonation$(
        userNameOrId: string,
        hidden: boolean,
        callerOptions: CallerRequestOptions,
    ): HTTPResponse$<Empty> {
        return this.send$({
            command: 'create',
            path: '/impersonation',
            nativeRequestOptions: {
                json: {
                    userId: userNameOrId,
                    hidden: hidden,
                },
            },
            callerOptions,
        })
    }

    public stopImpersonation$(
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Empty> {
        return this.send$({
            command: 'delete',
            path: '/impersonation',
            callerOptions,
        })
    }

    public getSessionDetails$(
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<SessionDetails> {
        return this.send$({
            command: 'query',
            path: `/session`,
            callerOptions,
        })
    }
}
