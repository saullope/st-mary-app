import { renderHook, act } from "@testing-library/react";
import { useSessionTimeout } from "../useSessionTimeout";
import { SESSION_IDLE_TIMEOUT_MS, SESSION_WARNING_BEFORE_MS } from "@/lib/auth/constants";

const mockSignOut = jest.fn().mockResolvedValue(undefined);
jest.mock("firebase/auth", () => ({ signOut: (...args: unknown[]) => mockSignOut(...args) }));
jest.mock("@/firebase/firebase", () => ({ auth: { currentUser: null } }));

const assign = jest.fn();
jest.mock("@/lib/browserNavigation", () => ({ hardNavigate: (url: string) => assign(url) }));

describe("useSessionTimeout", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    assign.mockReset();
    mockSignOut.mockClear();
    localStorage.clear();
    global.fetch = jest.fn().mockResolvedValue({ status: 200, json: () => Promise.resolve({ valid: false }) }) as jest.Mock;
  });

  afterEach(() => jest.useRealTimers());

  it("avisa antes de cerrar por inactividad y permite seguir conectado", () => {
    const { result } = renderHook(() => useSessionTimeout(true, jest.fn()));

    act(() => { jest.advanceTimersByTime(SESSION_IDLE_TIMEOUT_MS - SESSION_WARNING_BEFORE_MS + 1000); });
    expect(result.current.warning?.reason).toBe("idle");

    act(() => { result.current.stayConnected(); });
    expect(result.current.warning).toBeNull();
  });

  it("cierra la sesión al cumplir 30 minutos sin actividad", async () => {
    const onEnded = jest.fn();
    renderHook(() => useSessionTimeout(true, onEnded));

    await act(async () => { jest.advanceTimersByTime(SESSION_IDLE_TIMEOUT_MS + 1000); });

    expect(mockSignOut).toHaveBeenCalled();
    expect(onEnded).toHaveBeenCalled();
    expect(assign).toHaveBeenCalledWith(expect.stringContaining("/auth/login?reason=idle"));
  });

  it("la actividad del usuario reinicia el contador", () => {
    const { result } = renderHook(() => useSessionTimeout(true, jest.fn()));

    act(() => { jest.advanceTimersByTime(20 * 60 * 1000); });
    act(() => { window.dispatchEvent(new Event("keydown")); });
    act(() => { jest.advanceTimersByTime(20 * 60 * 1000); });

    expect(result.current.warning).toBeNull();
    expect(assign).not.toHaveBeenCalled();
  });
});
