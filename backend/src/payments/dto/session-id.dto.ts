import { IsNotEmpty, IsString, Matches } from 'class-validator';

/**
 * Stripe session IDs ont le format `cs_test_...` ou `cs_live_...`.
 * On valide pour éviter qu'un attaquant nous envoie n'importe quoi.
 */
export class SessionIdDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^cs_(test|live)_[A-Za-z0-9]{20,}$/, {
    message: 'session_id invalide',
  })
  session_id!: string;
}
