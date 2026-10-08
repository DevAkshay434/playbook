export interface RichpanelTicket {
  id: string;
  conversation_no?: number | string | null;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  status: string;
  is_trashed: boolean;
  subject?: string;
  last_message_sender_type?: string;
  tags?: string[];
  url?: string;
  comments?: RichpanelComment[];
  customer_profile?: any;
}

export interface RichpanelComment {
  id: string;
  type: string;
  body?: string;
  plain_body?: string;
  sender_type: string;
  public: boolean;
  created_at: string;
}

export interface RichpanelSearchResponse {
  count: number;
  next_page?: string | null;
  previous_page?: string | null;
  ticket: RichpanelTicket[];
}
