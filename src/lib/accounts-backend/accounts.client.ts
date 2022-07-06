import { Observable } from 'rxjs'
import { RootRouter } from '../router'
import { CallerRequestOptions, HTTPError, HTTPResponse$ } from '../utils'
import { Empty, SessionDetails } from './interfaces'

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
        return `${this.basePath}/openid_rp/logout?target_uri=${encodeURI(redirectUri)}${forget_user ? '&forget_me=true' : ''}`
    }

    public loginAsUserUrl(redirectUri: string): string {
        return `${this.basePath}/openid_rp/login?flow=user&target_uri=${encodeURI(redirectUri)}`
    }

    public loginAsTempUserUrl(redirectUri: string): string {
        return `${this.basePath}/openid_rp/login?flow=temp&target_uri=${encodeURI(redirectUri)}`
    }

    public sendRegisterMail$(
        { email, username }: { email: string, username?: string },
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Empty> {
        if (username === undefined) {
            username = email
        }
        console.log(`Shall register with username "${username}" and email ${email}`)
        return new Observable<HTTPError | Empty>(() => {
            throw new Error('Not implemented')
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
        return this.send$(
            {
                command: 'create',
                path: '/impersonation',
                nativeRequestOptions: {
                    json: {
                        userId: userNameOrId,
                        hidden: hidden,
                    },
                },
                callerOptions,
            },
        )
    }

    public stopImpersonation$(callerOptions: CallerRequestOptions = {}): HTTPResponse$<Empty> {
        return this.send$(
            {
                command: 'delete',
                path: '/impersonation',
                callerOptions,
            },
        )
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
