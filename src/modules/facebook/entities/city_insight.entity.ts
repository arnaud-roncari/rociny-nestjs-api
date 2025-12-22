export class CityInsightEntity {
  topCities: string[];

  constructor(params: CityInsightEntity) {
    this.topCities = params.topCities;
  }

  static fromBreakdowns(data: any[], max: number = 5): CityInsightEntity {
    const sorted = [...data]
      .filter((item) => Array.isArray(item.dimension_values))
      .sort((a, b) => Number(b.value) - Number(a.value))
      .slice(0, max);

    const topCities = sorted.map((item) => item.dimension_values[0]);

    return new CityInsightEntity({ topCities });
  }
}
