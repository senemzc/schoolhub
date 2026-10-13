import { describe, expect, it } from "vitest";
import { calculateGPA, gradeFromMarks, gradeFromPercent, isFail } from "./grading";

describe("NEB grading", () => {
  it("90+ is A+ 4.0", () => expect(gradeFromPercent(90)).toEqual({ grade: "A+", point: 4.0 }));
  it("89.9 is A 3.6", () => expect(gradeFromPercent(89.9)).toEqual({ grade: "A", point: 3.6 }));
  it("70 is B+ 3.2", () => expect(gradeFromPercent(70).grade).toBe("B+"));
  it("60 is B 2.8", () => expect(gradeFromPercent(60).point).toBe(2.8));
  it("50 is C+ 2.4", () => expect(gradeFromPercent(50).point).toBe(2.4));
  it("40 is C 2.0", () => expect(gradeFromPercent(40).point).toBe(2.0));
  it("35 is D 1.6", () => expect(gradeFromPercent(35)).toEqual({ grade: "D", point: 1.6 }));
  it("34.9 is NG", () => expect(gradeFromPercent(34.9).grade).toBe("NG"));
  it("uses marks over full marks", () => expect(gradeFromMarks(45, 50).grade).toBe("A+"));
  it("GPA averages grade points", () => expect(calculateGPA([4.0, 3.6, 3.2])).toBe(3.6));
  it("fails if any subject is NG", () => expect(isFail(["A+", "NG"])).toBe(true));
  it("passes when no NG", () => expect(isFail(["A+", "D"])).toBe(false));
});
