export class GenderInsightEntity {
  genderMalePercentage: number | null;
  genderFemalePercentage: number | null;

  constructor(params: GenderInsightEntity) {
    this.genderMalePercentage = params.genderMalePercentage;
    this.genderFemalePercentage = params.genderFemalePercentage;
  }

  static fromBreakdowns(data: any[]): GenderInsightEntity {
    let male = 0;
    let female = 0;

    data.forEach((item) => {
      const gender = item.dimension_values?.[0];
      const value = Number(item.value) || 0;

      if (gender === 'M') male += value;
      else if (gender === 'F') female += value;
    });

    const total = male + female;

    const genderMalePercentage =
      total > 0 ? Math.round((male / total) * 100) : null;
    const genderFemalePercentage =
      total > 0 ? Math.round((female / total) * 100) : null;

    return new GenderInsightEntity({
      genderMalePercentage,
      genderFemalePercentage,
    });
  }

  static empty(): GenderInsightEntity {
    return new GenderInsightEntity({
      genderMalePercentage: 1,
      genderFemalePercentage: 1,
    });
  }
}
