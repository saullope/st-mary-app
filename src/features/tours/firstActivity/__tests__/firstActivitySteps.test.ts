import { FIRST_ACTIVITY_STEPS } from "@/lib/tours/tourProgress";
import { FIRST_ACTIVITY_TOUR_STEPS, firstActivityHref, stepAt, stepFromSearch } from "../firstActivitySteps";

describe("first activity steps", () => {
  it("has one definition per step, each anchored to a data-tour attribute", () => {
    expect(FIRST_ACTIVITY_TOUR_STEPS).toHaveLength(FIRST_ACTIVITY_STEPS);
    for (const step of FIRST_ACTIVITY_TOUR_STEPS) expect(step.selector).toMatch(/^\[data-tour="[a-z-]+"\]$/);
  });

  it("goes from the dashboard to the LudiQuiz editor in the same tab", () => {
    expect(stepAt(1).route).toBe("/dashboard");
    expect(stepAt(2).route).toBe("/dashboard/create-activity");
    expect(stepAt(3).route).toBe("/create/ludiquiz");
    expect(stepAt(6).id).toBe("save");
  });

  it("opens the requested step from Settings and repairs bad values", () => {
    expect(firstActivityHref(4)).toBe("/create/ludiquiz?primera-actividad=4");
    expect(stepFromSearch("?primera-actividad=4")).toBe(4);
    expect(stepFromSearch("?primera-actividad=99")).toBe(1);
    expect(stepFromSearch("?otra=1")).toBeNull();
  });
});
