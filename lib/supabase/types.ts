// lib/supabase/types.ts
export type Rating = 'BUY' | 'HOLD' | 'SELL' | 'WATCH'

export interface Analysis {
  id: string
  created_at: string
  updated_at: string
  ticker: string
  title: string
  description: string | null
  rating: Rating
  sector: string | null
  analyst: string | null
  current_price: number | null
  price_target: number | null
  pdf_path: string | null
  pdf_name: string | null
  published: boolean
  author_id: string | null
  category: string | null
  pdfUrl?: string | null
}

export type Database = {
  public: {
    Tables: {
      analyses: {
        Row: Omit<Analysis, 'pdfUrl'>
        Insert: Omit<Analysis, 'id' | 'created_at' | 'updated_at' | 'pdfUrl'>
        Update: Partial<Omit<Analysis, 'id' | 'created_at' | 'pdfUrl'>>
      }
    }
  }
}