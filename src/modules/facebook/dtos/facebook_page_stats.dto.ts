export class FacebookPageStatsDto {
  id: string;
  name: string;
  fan_count: number;
  picture_url: string;

  posts_last_7_days: number;
  avg_likes: number;
  avg_comments: number;
}
