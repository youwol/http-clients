import { onHTTPErrors } from '../../lib'
import { AccountsClient } from '../../lib/accounts-backend'
import '../common'
import '../mock-requests'

const subject = new AccountsClient()
describe('account registration', () => {
    test('register status code 403', () => {
        return expect(
            subject.sendRegisterMail$({email: 'int_tests_yw-users@test-user', target_uri: ''} )
                .pipe(onHTTPErrors((e) => e.body['forbidden']), ).toPromise(),
        ).resolves.toBeDefined()
    })
})
