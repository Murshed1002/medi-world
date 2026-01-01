export type Doctor = {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  reviews: number;
  fee: number;
  availableToday?: boolean;
  nextSlot?: string;
  clinic: string;
  avatarUrl: string;
  online?: boolean;
  city?: string;
  supportsVideo?: boolean;
  isFemale?: boolean;
};
