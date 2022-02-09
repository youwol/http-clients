/** @format */

export interface HealthzResponse {
    status: 'py-youwol ok'
}

export interface LoginResponse {
    id: string
    name: string
    email: string
    memberOf: string[]
}
