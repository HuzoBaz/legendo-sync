# Node Module API

If you consume Legendo Sync as a module, expose functions that mirror HTTP behavior. As of now the repository doesn't export a programmatic API, but a suggested shape is below if you add one.

```ts
export interface TriggerRequest {
  input: string;
}

export interface TriggerResponse {
  ok: boolean;
  data?: unknown;
  error?: string;
}

export async function trigger(request: TriggerRequest): Promise<TriggerResponse> {
  // Implement to call internal service or HTTP
}
```
