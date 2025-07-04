export class AgeInsightEntity {
  topAgeRanges: string[];

  constructor(params: AgeInsightEntity) {
    this.topAgeRanges = params.topAgeRanges;
  }

  static fromBreakdowns(data: any[], max: number = 5): AgeInsightEntity {
    const sorted = [...data]
      .filter((item) => Array.isArray(item.dimension_values))
      .sort((a, b) => Number(b.value) - Number(a.value))
      .slice(0, max);

    const topAgeRanges = sorted.map((item) => item.dimension_values[0]);

    return new AgeInsightEntity({ topAgeRanges });
  }
}
