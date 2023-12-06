import { onHTTPErrors } from '@youwol/http-primitives'
import { AccountsClient } from '../../lib/accounts-backend'
import '../common'
import '../mock-requests'
import { firstValueFrom } from 'rxjs'

const subject = new AccountsClient()
describe('account registration', () => {
    test('register status code 403', () => {
        return expect(
            firstValueFrom(
                subject
                    .sendRegisterMail$({
                        email: 'int_tests_yw-users@test-user',
                        target_uri: '',
                    })
                    .pipe(onHTTPErrors((e) => e.body['forbidden'])),
            ),
        ).resolves.toBeDefined()
    })
})
