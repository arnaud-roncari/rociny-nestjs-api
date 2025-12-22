export class ReviewEntity {
  constructor(
    public id: number,
    public collaboration_id: number,
    public author_id: number,
    public reviewed_id: number,
    public stars: number,
    public description: string,
    public created_at: Date,
  ) {}

  static fromJson(row: any): ReviewEntity {
    return new ReviewEntity(
      row.id,
      row.collaboration_id,
      row.author_id,
      row.reviewed_id,
      row.stars,
      row.description,
      new Date(row.created_at),
    );
  }

  static fromJsons(rows: any[]): ReviewEntity[] {
    return rows.map(ReviewEntity.fromJson);
  }
}
