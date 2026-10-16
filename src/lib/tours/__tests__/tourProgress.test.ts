import {
  DEFAULT_FIRST_ACTIVITY,
  DEFAULT_TOUR_PREFERENCES,
  markCompleted,
  parseTourProgress,
  postpone,
  resetTours,
  serializeTourProgress,
  shouldInviteFirstActivity,
  shouldOfferResume,
  subjectPromptId,
} from "../tourProgress";

describe("parseTourProgress", () => {
  it("reads the legacy format (a list of completed tours)", () => {
    expect(parseTourProgress('["dashboard_tour","welcome_tour"]')).toEqual({
      completed: ["dashboard_tour", "welcome_tour"],
      later: [],
      firstActivity: DEFAULT_FIRST_ACTIVITY,
    });
  });

  it("reads the current format and round-trips", () => {
    const progress = {
      completed: ["dashboard_tour"],
      later: ["ludiquiz_tour"],
      firstActivity: { status: "en_progreso" as const, step: 4 },
    };
    expect(parseTourProgress(serializeTourProgress(progress))).toEqual(progress);
  });

  it("treats saved progress without the first-activity tour as pending", () => {
    expect(parseTourProgress('{"completed":["dashboard_tour"],"later":[]}').firstActivity).toEqual(DEFAULT_FIRST_ACTIVITY);
  });

  it("repairs an unknown status or an out-of-range step", () => {
    expect(parseTourProgress('{"firstActivity":{"status":"x","step":99}}').firstActivity).toEqual({ status: "pendiente", step: 6 });
    expect(parseTourProgress('{"firstActivity":{"status":"pospuesta","step":0}}').firstActivity).toEqual({ status: "pospuesta", step: 1 });
  });

  it("treats empty, broken or unexpected values as no progress", () => {
    for (const raw of [null, "", "{", "42", '{"completed":"x"}']) {
      expect(parseTourProgress(raw)).toEqual({ completed: [], later: [], firstActivity: DEFAULT_FIRST_ACTIVITY });
    }
  });

  it("drops invalid ids and duplicates", () => {
    expect(parseTourProgress('["ok_tour","ok_tour","<script>",7]').completed).toEqual(["ok_tour"]);
  });
});

describe("first activity tour", () => {
  it("invites only new teachers with tours enabled and no activities", () => {
    expect(shouldInviteFirstActivity(DEFAULT_TOUR_PREFERENCES, false)).toBe(true);
    expect(shouldInviteFirstActivity(DEFAULT_TOUR_PREFERENCES, true)).toBe(false);
    expect(shouldInviteFirstActivity({ ...DEFAULT_TOUR_PREFERENCES, toursEnabled: false }, false)).toBe(false);
  });

  it("never invites again once postponed, started or finished", () => {
    for (const status of ["pospuesta", "en_progreso", "completada"] as const) {
      expect(shouldInviteFirstActivity({ ...DEFAULT_TOUR_PREFERENCES, firstActivity: { status, step: 2 } }, false)).toBe(false);
    }
  });

  it("offers to resume only a tour left halfway", () => {
    const halfway = { ...DEFAULT_TOUR_PREFERENCES, firstActivity: { status: "en_progreso" as const, step: 3 } };
    expect(shouldOfferResume(halfway)).toBe(true);
    expect(shouldOfferResume({ ...halfway, toursEnabled: false })).toBe(false);
    expect(shouldOfferResume(DEFAULT_TOUR_PREFERENCES)).toBe(false);
  });
});

describe("progress updates", () => {
  it("'Remind me later' postpones the given tours but keeps completed ones", () => {
    const progress = postpone(
      { completed: ["dashboard_tour"], later: [], firstActivity: DEFAULT_FIRST_ACTIVITY },
      ["dashboard_tour", "create_activity_tour", "ludiquiz_tour"],
    );
    expect(progress.completed).toEqual(["dashboard_tour"]);
    expect(progress.later).toEqual(["create_activity_tour", "ludiquiz_tour"]);
  });

  it("completing a postponed tour removes it from later", () => {
    const progress = { completed: [], later: ["ludiquiz_tour"], firstActivity: DEFAULT_FIRST_ACTIVITY };
    expect(markCompleted(progress, "ludiquiz_tour")).toEqual({
      completed: ["ludiquiz_tour"],
      later: [],
      firstActivity: DEFAULT_FIRST_ACTIVITY,
    });
  });

  it("reset offers the given tours again and leaves the rest", () => {
    const progress = resetTours(
      { completed: ["dashboard_tour", subjectPromptId(1)], later: ["ludiquiz_tour"], firstActivity: DEFAULT_FIRST_ACTIVITY },
      ["dashboard_tour", "ludiquiz_tour"],
    );
    expect(progress).toEqual({ completed: ["subjects_grade_1"], later: [], firstActivity: DEFAULT_FIRST_ACTIVITY });
  });
});
