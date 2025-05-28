import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ContentType } from '../dtos/collaboration-request.dto';


interface PostStatsDto {
  date: string;
  views: number;
  likes: number;
  comments: number;
  saves: number;
  profileVisits: number;
  newFollowers: number;
  accountsReached: number;
  interactingAccounts: number;
  contentType: ContentType;
}

interface InfluencerProfile {
  name: string;
  gender: 'FEMALE' | 'MALE';
  nicheCategory: string;
  followers: number;
  posts: PostStatsDto[];
}

@Injectable()
export class InfluencerRepositoryService {
  private dataPath = path.join(__dirname, '../data/influenceurs.json');

getAllInfluencers(): InfluencerProfile[] {
  const raw = fs.readFileSync(this.dataPath, 'utf-8');
  const json = JSON.parse(raw);
    
  return json.map((influencer: any) => ({
  ...influencer,
  posts: influencer.posts.map((post: any) => ({
    ...post,
    interactingAccounts: post.interactingAccounts ?? (
      post.likes + post.comments + post.saves
    ),
    contentType: ContentType[post.contentType as keyof typeof ContentType]
  })) as PostStatsDto[]
}));
  
}
  
}