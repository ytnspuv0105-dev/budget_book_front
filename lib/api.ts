import type { ApiError } from "@/types/api";
import type { Category, CategoryInput } from "@/types/category";
import type {
  Transaction,
  TransactionInput,
  TransactionListResponse,
} from "@/types/transaction";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

const request = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL が設定されていません");
  }

  const response = await fetch(`${API_URL}${path}`, options);

  if (!response.ok) {
    let message = `APIリクエストに失敗しました (${response.status})`;

    try {
      const body = (await response.json()) as ApiError;

      if (typeof body.detail === "string") {
        message = body.detail;
      }
    } catch {
      // JSONではないエラーレスポンスでは標準メッセージを使用する。
    }

    throw new ApiRequestError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

const jsonOptions = (method: "POST" | "PUT", body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const getTransactions = (): Promise<TransactionListResponse> =>
  request("/api/transactions");

export const createTransaction = (
  data: TransactionInput,
): Promise<Transaction> =>
  request("/api/transactions", jsonOptions("POST", data));

export const updateTransaction = (
  id: number,
  data: TransactionInput,
): Promise<Transaction> =>
  request(`/api/transactions/${id}`, jsonOptions("PUT", data));

export const deleteTransaction = (id: number): Promise<void> =>
  request(`/api/transactions/${id}`, { method: "DELETE" });

export const getCategories = (): Promise<Category[]> =>
  request("/api/categories");

export const createCategory = (data: CategoryInput): Promise<Category> =>
  request("/api/categories", jsonOptions("POST", data));

export const updateCategory = (
  id: number,
  data: CategoryInput,
): Promise<Category> =>
  request(`/api/categories/${id}`, jsonOptions("PUT", data));

export const getApiErrorMessage = (
  error: unknown,
  fallback: string,
): string => (error instanceof Error ? error.message : fallback);
