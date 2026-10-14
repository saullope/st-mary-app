import {
  DEFAULT_TOUR_PREFERENCES,
  ONBOARDING_JOURNEY,
  markCompleted,
  parseTourProgress,
  postpone,
  resetTours,
  serializeTourProgress,
  shouldAutoStart,
  subjectPromptId,
} from "../tourProgress";

describe("parseTourProgress", () => {
  it("reads the legacy format (a list of completed tours)", () => {
    expect(parseTourProgress('["dashboard_tour","welcome_tour"]')).toEqual({
      completed: ["dashboard_tour", "welcome_tour"],
      later: [],
    });
  });

  it("reads the current format and round-trips", () => {
    const progress = { completed: ["dashboard_tour"], later: ["ludiquiz_tour"] };
    expect(parseTourProgress(serializeTourProgress(progress))).toEqual(progress);
  });

  it("treats empty, broken or unexpected values as no progress", () => {
    for (const raw of [null, "", "{", "42", '{"completed":"x"}']) {
      expect(parseTourProgress(raw)).toEqual({ completed: [], later: [] });
    }
  });

  it("drops invalid ids and duplicates", () => {
    expect(parseTourProgress('["ok_tour","ok_tour","<script>",7]').completed).toEqual(["ok_tour"]);
  });
});

describe("shouldAutoStart", () => {
  it("starts pending tours only when tours are enabled", () => {
    expect(shouldAutoStart(DEFAULT_TOUR_PREFERENCES, "dashboard_tour")).toBe(true);
    expect(shouldAutoStart({ ...DEFAULT_TOUR_PREFERENCES, toursEnabled: false }, "dashboard_tour")).toBe(false);
  });

  it("never reopens a completed or postponed tour on its own", () => {
    const prefs = { ...DEFAULT_TOUR_PREFERENCES, completed: ["dashboard_tour"], later: ["ludiquiz_tour"] };
    expect(shouldAutoStart(prefs, "dashboard_tour")).toBe(false);
    expect(shouldAutoStart(prefs, "ludiquiz_tour")).toBe(false);
  });
});

describe("progress updates", () => {
  it("'Remind me later' postpones the rest of the journey but keeps completed tours", () => {
    const progress = postpone({ completed: ["welcome_tour"], later: [] }, ONBOARDING_JOURNEY);
    expect(progress.completed).toEqual(["welcome_tour"]);
    expect(progress.later).toEqual(["dashboard_tour", "create_activity_tour", "ludiquiz_tour"]);
  });

  it("completing a postponed tour removes it from later", () => {
    expect(markCompleted({ completed: [], later: ["ludiquiz_tour"] }, "ludiquiz_tour")).toEqual({
      completed: ["ludiquiz_tour"],
      later: [],
    });
  });

  it("reset offers the given tours again and leaves the rest", () => {
    const progress = resetTours(
      { completed: ["dashboard_tour", subjectPromptId(1)], later: ["ludiquiz_tour"] },
      ["dashboard_tour", "ludiquiz_tour"],
    );
    expect(progress).toEqual({ completed: ["subjects_grade_1"], later: [] });
  });
});
