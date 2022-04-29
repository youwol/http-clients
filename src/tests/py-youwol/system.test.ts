import { mergeMap } from 'rxjs/operators'
import { raiseHTTPErrors } from '../../lib'
import { PyYouwolClient } from '../../lib/py-youwol'

import { expectAttributes } from '../common'
/* eslint-disable jest/no-done-callback -- eslint-comment Find a good way to work with rxjs in jest */
import '../mock-requests'
import { setup$ } from './utils'

const pyYouwol = new PyYouwolClient()

beforeAll(async (done) => {
    setup$().subscribe(() => {
        done()
    })
})

test('pyYouwol.admin.system.queryRootLogs', (done) => {
    pyYouwol.admin.system
        .queryRootLogs$({ fromTimestamp: Date.now(), maxCount: 100 })
        .pipe(raiseHTTPErrors())
        .subscribe((resp) => {
            expectAttributes(resp.logs[0], [
                'level',
                'attributes',
                'labels',
                'text',
                'contextId',
                'parentContextId',
                'timestamp',
            ])
            // This has to be the last log
            expectAttributes(resp.logs[0].attributes, [
                'router',
                'method',
                'traceId',
            ])
            done()
        })
})

test('pyYouwol.admin.system.queryLogs', (done) => {
    pyYouwol.admin.system
        .queryRootLogs$({ fromTimestamp: Date.now(), maxCount: 100 })
        .pipe(
            raiseHTTPErrors(),
            mergeMap(({ logs }) =>
                pyYouwol.admin.system.queryLogs$(logs[0].contextId),
            ),
            raiseHTTPErrors(),
        )
        .subscribe((resp) => {
            expectAttributes(resp, ['logs'])
            expect(resp.logs.length).toBeGreaterThan(1)
            done()
        })
})

test('pyYouwol.admin.system.queryFolderContent', (done) => {
    pyYouwol.admin.system
        .queryFolderContent$('./')
        .pipe(raiseHTTPErrors())
        .subscribe((resp) => {
            // the folder is py-youwol/youwol
            expectAttributes(resp, ['files', 'folders'])
            expect(resp.files.find((f) => f == 'main.py')).toBeTruthy()
            expect(resp.folders.find((f) => f == 'routers')).toBeTruthy()
            done()
        })
})

test('pyYouwol.admin.system.getFileContent', (done) => {
    pyYouwol.admin.system
        .getFileContent$('./main.py')
        .pipe(raiseHTTPErrors())
        .subscribe((resp) => {
            expect(resp).toBeTruthy()
            done()
        })
})
/* eslint-enable jest/no-done-callback -- re-enable */
