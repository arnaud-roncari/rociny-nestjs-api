export class InsightDateRangeDto {
  since: string; // YYYY-MM-DD
  until: string; // YYYY-MM-DD

  constructor(data: InsightDateRangeDto) {
    this.since = data.since;
    this.until = data.until;
  }
}