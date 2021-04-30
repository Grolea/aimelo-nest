export interface KVGetResponse {
    LockIndex: number;
    Key: string;
    Flags: number;
    Value: string;
    CreateIndex: number;
    ModifyIndex: number;
}
