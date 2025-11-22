import { AttackStatus } from '../types.js';

interface GetAttackStatusParams {
  hit: boolean;
  sunk: boolean;
}

export const getAttackStatus = ({ hit, sunk }: GetAttackStatusParams): AttackStatus => {
  if (sunk) {
    return AttackStatus.Killed;
  }
  if (hit) {
    return AttackStatus.Shot;
  }
  return AttackStatus.Miss;
};
