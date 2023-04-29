export class ApiSuccessResponse<T> {
    protected data!: T
    constructor(data: T) {
        this.data = data
    }
}