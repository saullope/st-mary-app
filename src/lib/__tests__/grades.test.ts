import { gradeIdFromKey } from "../grades";

describe("gradeIdFromKey", () => {
  it("reconoce el formato de la base de datos y el del seed", () => {
    expect(gradeIdFromKey("first_grade")).toBe(1);
    expect(gradeIdFromKey("second_grade")).toBe(2);
    expect(gradeIdFromKey("third_grade")).toBe(3);
    expect(gradeIdFromKey("thirdGrade")).toBe(3);
  });

  it("devuelve null si no hay grado o no se reconoce", () => {
    expect(gradeIdFromKey(null)).toBeNull();
    expect(gradeIdFromKey("")).toBeNull();
    expect(gradeIdFromKey("fourth_grade")).toBeNull();
  });
});
