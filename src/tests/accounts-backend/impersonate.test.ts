import { raiseHTTPErrors } from '@youwol/http-primitives'
import { AccountsClient } from '../../lib/accounts-backend'
import '../common'
import '../mock-requests'

const subject = new AccountsClient()

describe('impersonation (forbidden because no admin client in IT config', () => {
    test('start visible impersonation', () => {
        return expect(
            subject
                .startVisibleImpersonation$('coco')
                .pipe(raiseHTTPErrors())
                .toPromise(),
        ).rejects.toEqual(expect.objectContaining({ status: 403 }))
    })
    test('start hidden impersonation', () => {
        return expect(
            subject
                .startHiddenImpersonation$('coco')
                .pipe(raiseHTTPErrors())
                .toPromise(),
        ).rejects.toEqual(expect.objectContaining({ status: 403 }))
    })
    test('stop visible impersonation', () => {
        return expect(
            subject.stopImpersonation$().pipe(raiseHTTPErrors()).toPromise(),
        ).rejects.toEqual(expect.objectContaining({ status: 403 }))
    })
})
