/** @format */

// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment Find a good way to work with rxjs in jest */
import '../mock-requests'

import { expectAttributes, resetPyYouwolDbs$ } from '../common'
import { raiseHTTPErrors } from '../../lib'
import { PyYouwolClient } from '../../lib/py-youwol'
import { mergeMap } from 'rxjs/operators'

const pyYouwol = new PyYouwolClient()

beforeAll(async (done) => {
    resetPyYouwolDbs$().subscribe(() => {
        done()
    })
})

test('pyYouwol.admin.system.queryRootLogs', (done) => {
    pyYouwol.admin.system
        .queryRootLogs$({ fromTimestamp: Date.now(), maxCount: 100 })
        .pipe(raiseHTTPErrors())
        .subscribe((resp) => {
            expectAttributes(resp, ['logs'])
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
            expect(resp.logs[0].attributes).toEqual({
                service: 'admin/logs',
                router: 'system',
                method: 'GET',
            })
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
