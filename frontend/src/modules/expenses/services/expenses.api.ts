import { api } from "@/shared/api/client";
import { normalizeServerDate } from "@/shared/utils/datetime";
import type {
  Expense,
  ExpenseCategory,
  ExpenseFilters,
  ExpenseInput,
  ExpenseSummary,
} from "@/modules/expenses/types/expenses.types";

/** Raw snake_case expense shape returned by the backend. */
interface ExpenseDto {
  id: number;
  title: string;
  amount_cents: number;
  category: ExpenseCategory;
  spent_on: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

interface ExpenseSummaryDto {
  month_total_cents: number;
  month_count: number;
  latest_title: string | null;
  last_updated: string | null;
}

/** Convert a snake_case DTO into the camelCase domain expense. */
export function mapExpense(dto: ExpenseDto): Expense {
  return {
    id: dto.id,
    title: dto.title,
    amountCents: dto.amount_cents,
    category: dto.category,
    spentOn: dto.spent_on,
    note: dto.note,
    createdAt: normalizeServerDate(dto.created_at),
    updatedAt: normalizeServerDate(dto.updated_at),
  };
}

function toPayload(input: Partial<ExpenseInput>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (input.title !== undefined) payload.title = input.title;
  if (input.amountCents !== undefined) payload.amount_cents = input.amountCents;
  if (input.category !== undefined) payload.category = input.category;
  if (input.spentOn !== undefined) payload.spent_on = input.spentOn;
  if (input.note !== undefined) payload.note = input.note;
  return payload;
}

function buildQuery(filters: ExpenseFilters): string {
  const params = new URLSearchParams();
  if (filters.category && filters.category !== "all") params.set("category", filters.category);
  if (filters.query && filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.fromDate) params.set("from", filters.fromDate);
  if (filters.toDate) params.set("to", filters.toDate);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchExpenses(filters: ExpenseFilters = {}): Promise<Expense[]> {
  const dtos = await api.get<ExpenseDto[]>(`/expenses${buildQuery(filters)}`);
  return dtos.map(mapExpense);
}

export async function fetchExpense(id: number): Promise<Expense> {
  const dto = await api.get<ExpenseDto>(`/expenses/${id}`);
  return mapExpense(dto);
}

export async function createExpense(input: ExpenseInput): Promise<Expense> {
  const dto = await api.post<ExpenseDto>("/expenses", toPayload(input));
  return mapExpense(dto);
}

export async function updateExpense(
  id: number,
  input: Partial<ExpenseInput>,
): Promise<Expense> {
  const dto = await api.patch<ExpenseDto>(`/expenses/${id}`, toPayload(input));
  return mapExpense(dto);
}

export async function deleteExpense(id: number): Promise<void> {
  await api.delete<void>(`/expenses/${id}`);
}

export async function fetchExpenseSummary(): Promise<ExpenseSummary> {
  const dto = await api.get<ExpenseSummaryDto>("/expenses/summary");
  return {
    monthTotalCents: dto.month_total_cents,
    monthCount: dto.month_count,
    latestTitle: dto.latest_title,
    lastUpdated: normalizeServerDate(dto.last_updated),
  };
}
