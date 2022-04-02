import { shell$ } from '../cdn-backend/shell'
import {
    createStory,
    getGlobalContents,
    getStory,
    updateGlobalContents,
} from './shell.operators'
import { resetPyYouwolDbs$ } from '../common'

beforeAll(async (done) => {
    resetPyYouwolDbs$().subscribe(() => {
        done()
    })
})

class TestData {
    constructor(params: {}) {
        Object.assign(this, params)
    }
}

test('create story, play with global attributes', (done) => {
    const title = 'test story: play with content'
    const storyId = 'test-story-play-with-content'
    shell$<TestData>()
        .pipe(
            createStory(storyId, title, (shell, _resp) => {
                return shell.data
            }),
            getStory(storyId, (shell, resp) => {
                expect(resp.storyId).toBe(storyId)
                expect(resp.title).toBe(title)
                expect(resp.rootDocumentId).toBe(`root_${resp.storyId}`)
                expect(resp.authors).toHaveLength(1)
                return shell.data
            }),
            getGlobalContents(storyId, (shell, _resp) => {
                return shell.data
            }),
            updateGlobalContents(
                storyId,
                { javascript: 'test javascript' },
                (shell, _resp) => {
                    return shell.data
                },
            ),
            getGlobalContents(storyId, (shell, resp) => {
                expect(resp.javascript).toBe('test javascript')
                return shell.data
            }),
        )
        .subscribe(() => {
            done()
        })
})
