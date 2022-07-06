import { AccountsClient } from '../../lib/accounts-backend/accounts.client'

const subject = new AccountsClient()
describe('account registration', () => {
    test('register is not implemented', () => {
        return expect(
            subject.sendRegisterMail$({ email: 'test@test.org' }).toPromise(),
        ).rejects.toMatchObject(new Error('Not implemented'))
    })
})
