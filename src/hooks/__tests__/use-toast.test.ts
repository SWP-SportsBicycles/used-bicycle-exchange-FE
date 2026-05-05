/**
 * Tests for the toast reducer (state management).
 * @module hooks/use-toast
 */
import { describe, it, expect } from "vitest";
import { reducer } from "@/hooks/use-toast";

const makeToast = (id: string) => ({
  id,
  open: true,
  onOpenChange: () => {},
});

describe("toast reducer", () => {
  it("should add a toast", () => {
    const state = { toasts: [] };
    const result = reducer(state, { type: "ADD_TOAST", toast: makeToast("1") });
    expect(result.toasts).toHaveLength(1);
    expect(result.toasts[0].id).toBe("1");
  });

  it("should limit toasts to TOAST_LIMIT (1)", () => {
    const state = { toasts: [makeToast("1")] };
    const result = reducer(state, { type: "ADD_TOAST", toast: makeToast("2") });
    // Newest toast comes first, limit is 1
    expect(result.toasts).toHaveLength(1);
    expect(result.toasts[0].id).toBe("2");
  });

  it("should update a specific toast", () => {
    const state = { toasts: [makeToast("1")] };
    const result = reducer(state, {
      type: "UPDATE_TOAST",
      toast: { id: "1", title: "Updated" },
    });
    expect(result.toasts[0].title).toBe("Updated");
  });

  it("should dismiss a specific toast (set open=false)", () => {
    const state = { toasts: [makeToast("1")] };
    const result = reducer(state, { type: "DISMISS_TOAST", toastId: "1" });
    expect(result.toasts[0].open).toBe(false);
  });

  it("should dismiss all toasts when no toastId provided", () => {
    const state = { toasts: [makeToast("1"), makeToast("2")] };
    const result = reducer(state, { type: "DISMISS_TOAST" });
    result.toasts.forEach((t) => expect(t.open).toBe(false));
  });

  it("should remove a specific toast", () => {
    const state = { toasts: [makeToast("1"), makeToast("2")] };
    const result = reducer(state, { type: "REMOVE_TOAST", toastId: "1" });
    expect(result.toasts).toHaveLength(1);
    expect(result.toasts[0].id).toBe("2");
  });

  it("should remove all toasts when toastId is undefined", () => {
    const state = { toasts: [makeToast("1"), makeToast("2")] };
    const result = reducer(state, { type: "REMOVE_TOAST" });
    expect(result.toasts).toHaveLength(0);
  });
});
