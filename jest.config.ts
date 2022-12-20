import { Config } from 'jest'

const t: Config = {
    preset: '@youwol/jest-preset',
    modulePathIgnorePatterns: [
        'src/tests/files-backend/test-data/package.json',
        'src/tests/accounts-backend/login_logout.test.ts',
    ],
}
export default t
