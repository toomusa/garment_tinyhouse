export interface CreateBookingInput {
  id: string;
  source: string;
  checkIn: string;
  checkOut: string;
}

export interface CreateBookingArgs {
  input: CreateBookingInput;
}

export interface GetSecretInput {
  id: string;
  checkIn: string;
  checkOut: string;
}

export interface GetSecretArgs {
  input: GetSecretInput;
}

