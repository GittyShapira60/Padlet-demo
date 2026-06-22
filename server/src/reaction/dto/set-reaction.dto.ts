import { Matches, MaxLength } from 'class-validator';

export class SetReactionDto {
  @MaxLength(32)
  @Matches(/^[a-z0-9_]+$/)
  reaction_code!: string;
}
