
export class DbResult<Type> {

    public status: string;
    public item?: Type

    public constructor(status: string, item: Type) {
        this.status = status;
        this.item = item;
    }
}