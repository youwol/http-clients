import { AccountsClient } from '../../lib/accounts-backend'
import '../common'
import '../mock-requests'

const subject = new AccountsClient()
const keycloak_logout =
    /\/auth\/realms\/.*\/protocol\/openid-connect\/logout\?redirect_uri=/
const keycloak_auth = /\/auth\/realms\/.*\/protocol\/openid-connect\/auth\?/

describe('logout', () => {
    const target_uri = 'https://platform.youwol.com/inexisting/target/uri'
    const url = subject.logoutUrl(target_uri)
    test(`header yw_jwt deleted`, () => {
        return expect(
            fetch(new Request(url, { redirect: 'manual' })).then((resp) =>
                resp.headers.get('Set-Cookie'),
            ),
        ).resolves.toMatch(/yw_jwt=/)
    })
    test(`header yw_login_hint deleted with forget user`, () => {
        const url_forget_user = subject.logoutAndForgetUserUrl(target_uri)
        return expect(
            fetch(new Request(url_forget_user, { redirect: 'manual' })).then(
                (resp) => resp.headers.get('Set-Cookie'),
            ),
        ).resolves.toMatch(/yw_login_hint=/)
    })
    test(`redirect with 307 temporary redirection`, () => {
        return expect(
            fetch(new Request(url, { redirect: 'manual' })).then(
                (resp) => resp.status,
            ),
        ).resolves.toBe(307)
    })
    test(`redirect to keycloak OIDC logout`, () => {
        return expect(
            fetch(new Request(url, { redirect: 'manual' })).then((resp) =>
                resp.headers.get('Location'),
            ),
        ).resolves.toMatch(keycloak_logout)
    })
    test(`keycloak logout redirect with 302 found`, () => {
        return expect(
            fetch(new Request(url, { redirect: 'manual' }))
                .then((resp) => resp.headers.get('Location'))
                .then((url) => fetch(new Request(url, { redirect: 'manual' })))
                .then((resp) => resp.status),
        ).resolves.toBe(302)
    })
    test('keycloak logout redirect to target uri', () => {
        return expect(
            fetch(new Request(url, { redirect: 'manual' }))
                .then((resp) => resp.headers.get('Location'))
                .then((url) => fetch(new Request(url, { redirect: 'manual' })))
                .then((resp) => resp.headers.get('Location')),
        ).resolves.toBe(target_uri)
    })
})

describe('user login', () => {
    const target_uri = 'https://platform.youwol.com/inexisting/target/uri'
    const url = subject.loginAsUserUrl(target_uri)
    test(`307 temporary redirection`, () => {
        return expect(
            fetch(new Request(url, { redirect: 'manual' })).then(
                (resp) => resp.status,
            ),
        ).resolves.toBe(307)
    })
    test(`redirect to keycloak login page`, () => {
        return expect(
            fetch(new Request(url, { redirect: 'manual' })).then((resp) =>
                resp.headers.get('Location'),
            ),
        ).resolves.toMatch(keycloak_auth)
    })
    test(`login page status OK`, () => {
        return expect(
            fetch(new Request(url, { redirect: 'manual' }))
                .then((resp) => resp.headers.get('Location'))
                .then((url) => fetch(new Request(url, { redirect: 'manual' })))
                .then((resp) => resp.status),
        ).resolves.toBe(200)
    })
    test('login page can log', () => {
        return expect(
            fetch(new Request(url, { redirect: 'manual' }))
                .then((resp) => resp.headers.get('Location'))
                .then((url) => fetch(new Request(url, { redirect: 'manual' })))
                .then((resp) => resp.text()),
        ).resolves.toContain('login-actions/authenticate')
    })
})

describe('temp user login', () => {
    const target_uri = 'https://platform.youwol.com/inexisting/target/uri'
    const url = subject.loginAsTempUserUrl(target_uri)
    test('403 because no admin client in IT config', () => {
        return expect(
            fetch(new Request(url)).then((resp) => resp.status),
        ).resolves.toBe(403)
    })
})
