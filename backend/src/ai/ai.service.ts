import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { Profile } from '../profiles/entities/profile.entity';

export interface CompatibilityResult {
  score: number;
  summary: string;
  breakdown: {
    interests: number;
    values: number;
    lifestyle: number;
    goals: number;
    personality: number;
  };
  commonTopics: string[];
  potentialChallenges: string[];
  icebreakers: string[];
}

@Injectable()
export class AiService {
  private client: Anthropic;
  private logger = new Logger('AiService');

  constructor(private configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.configService.get('ANTHROPIC_API_KEY'),
    });
  }

  async analyzeCompatibility(p1: Profile, p2: Profile): Promise<string> {
    const prompt = this.buildCompatibilityPrompt(p1, p2);
    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        system: `You are a compassionate dating compatibility analyst. 
Analyze two anonymized personality profiles and provide a concise compatibility assessment.
Focus on shared values, interests, and communication styles.
Never reference appearance, age, location, or any identifying information.
Always be encouraging and constructive. Respond in JSON format only.`,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      return text;
    } catch (e) {
      this.logger.warn(`AI analysis failed: ${e.message}`);
      return null;
    }
  }

  async generateIcebreakers(p1: Profile, p2: Profile): Promise<string[]> {
    const commonTags = p1.interestTags?.filter((t) =>
      p2.interestTags?.includes(t),
    ) || [];

    const prompt = `Two people matched on a blind dating app. 
Their common interests: ${commonTags.slice(0, 5).join(', ') || 'general topics'}.
Profile 1 goals: ${p1.relationshipGoal}, personality: ${p1.personalityType || 'unknown'}.
Profile 2 goals: ${p2.relationshipGoal}, personality: ${p2.personalityType || 'unknown'}.

Generate 5 fun, engaging conversation starters that feel natural and specific to their shared interests.
Return as JSON array of strings. No numbering, no preamble.`;

    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      });
      const text = response.content[0].type === 'text' ? response.content[0].text : '[]';
      const cleaned = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      this.logger.warn(`Icebreaker generation failed: ${e.message}`);
      return [
        'What\'s something you\'re currently obsessed with?',
        'If you could master any skill overnight, what would it be?',
        'What\'s the best thing that happened to you this week?',
      ];
    }
  }

  async moderateContent(text: string): Promise<{ safe: boolean; reason?: string }> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 100,
        system: 'You are a content moderation system. Respond ONLY with JSON: {"safe": true/false, "reason": "string or null"}',
        messages: [{
          role: 'user',
          content: `Moderate this message for hate speech, harassment, explicit content, or spam: "${text.slice(0, 500)}"`,
        }],
      });
      const raw = response.content[0].type === 'text' ? response.content[0].text : '{"safe":true}';
      return JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      return { safe: true };
    }
  }

  async generateDailyQuestion(): Promise<string> {
    const response = await this.client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: 'Generate one thoughtful, open-ended question for a dating app profile that reveals personality without being too personal. Return only the question, nothing else.',
      }],
    });
    return response.content[0].type === 'text'
      ? response.content[0].text.trim()
      : 'What's something small that brings you unexpected joy?';
  }

  private buildCompatibilityPrompt(p1: Profile, p2: Profile): string {
    return `Analyze compatibility between these two anonymous profiles:

PROFILE A:
- Interests: ${p1.interestTags?.slice(0, 10).join(', ') || 'not specified'}
- Personality traits: ${p1.personalityTags?.slice(0, 5).join(', ') || 'not specified'}
- Lifestyle: ${p1.lifestyleTags?.slice(0, 5).join(', ') || 'not specified'}
- Relationship goal: ${p1.relationshipGoal || 'not specified'}
- MBTI: ${p1.personalityType || 'unknown'}
- Family values: ${p1.familyValues || 'not specified'}

PROFILE B:
- Interests: ${p2.interestTags?.slice(0, 10).join(', ') || 'not specified'}
- Personality traits: ${p2.personalityTags?.slice(0, 5).join(', ') || 'not specified'}
- Lifestyle: ${p2.lifestyleTags?.slice(0, 5).join(', ') || 'not specified'}
- Relationship goal: ${p2.relationshipGoal || 'not specified'}
- MBTI: ${p2.personalityType || 'unknown'}
- Family values: ${p2.familyValues || 'not specified'}

Respond with JSON:
{
  "score": 0-100,
  "summary": "2-3 sentence compatibility summary",
  "breakdown": {"interests": 0-100, "values": 0-100, "lifestyle": 0-100, "goals": 0-100, "personality": 0-100},
  "commonTopics": ["topic1", "topic2"],
  "potentialChallenges": ["challenge1"],
  "icebreakers": ["question1", "question2", "question3"]
}`;
  }
}
