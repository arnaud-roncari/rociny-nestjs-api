export class MediaInsightEntity {
  interactionPercentagePosts: number;
  interactionPercentageReels: number;
  postPercentage: number;
  reelPercentage: number;
  lastMediaUrl: string;

  constructor(params: MediaInsightEntity) {
    this.interactionPercentagePosts = params.interactionPercentagePosts;
    this.interactionPercentageReels = params.interactionPercentageReels;
    this.postPercentage = params.postPercentage;
    this.reelPercentage = params.reelPercentage;
    this.lastMediaUrl = params.lastMediaUrl;
  }

  static fromMediaList(mediaList: any[]): MediaInsightEntity {
    const postTypes = ['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM'];
    const posts = mediaList.filter((m) => postTypes.includes(m.media_type));
    const reels = mediaList.filter((m) => m.media_type === 'REEL');

    const total = mediaList.length;
    const totalPosts = posts.length;
    const totalReels = reels.length;

    const postInteractions = posts.reduce(
      (sum, m) => sum + (m.like_count || 0) + (m.comments_count || 0),
      0,
    );
    const reelInteractions = reels.reduce(
      (sum, m) => sum + (m.like_count || 0) + (m.comments_count || 0),
      0,
    );
    const totalInteractions = postInteractions + reelInteractions;

    return new MediaInsightEntity({
      interactionPercentagePosts:
        totalInteractions > 0
          ? Math.round((postInteractions / totalInteractions) * 100)
          : 0,
      interactionPercentageReels:
        totalInteractions > 0
          ? Math.round((reelInteractions / totalInteractions) * 100)
          : 0,
      postPercentage: total > 0 ? Math.round((totalPosts / total) * 100) : 0,
      reelPercentage: total > 0 ? Math.round((totalReels / total) * 100) : 0,
      lastMediaUrl: mediaList[0]?.media_url ?? '',
    });
  }
}
