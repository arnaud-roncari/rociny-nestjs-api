export class ViewsHistoryEntity {
  date: Date;
  views: number;

  constructor(date: Date, views: number) {
    this.date = date;
    this.views = views;
  }

  static fromJson(json: any): ViewsHistoryEntity {
    const parsedDate = new Date(json.date);
    return new ViewsHistoryEntity(parsedDate, json.views);
  }

  static fromJsons(jsons: any[]): ViewsHistoryEntity[] {
    return jsons.map(ViewsHistoryEntity.fromJson);
  }

  toJson(): any {
    return {
      date: this.date.toISOString(),
      views: this.views,
    };
  }

  static toJsons(entities: ViewsHistoryEntity[]): any[] {
    return entities.map((entity) => entity.toJson());
  }
}
