export type Status =
  | 'posted'
  | 'waiting'
  | 'withdrew'
  | 'delivered'
  | 'returned'

export const StatusOptions: {
  posted: 'posted'
  waiting: 'waiting'
  withdrew: 'withdrew'
  delivered: 'delivered'
  returned: 'returned'
} = {
  posted: 'posted',
  waiting: 'waiting',
  withdrew: 'withdrew',
  delivered: 'delivered',
  returned: 'returned',
}

export const StatusArr = [
  'posted',
  'waiting',
  'withdrew',
  'delivered',
  'returned',
] as const
