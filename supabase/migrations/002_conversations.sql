-- Create conversations table for storing encrypted conversation data
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL, -- 클라이언트에서 생성한 ID
  title TEXT NOT NULL,
  encrypted_data TEXT NOT NULL, -- 암호화된 대화 내용
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 클라이언트 ID와 사용자 ID의 조합이 유일해야 함
  UNIQUE(user_id, conversation_id)
);

-- Index for faster queries
CREATE INDEX conversations_user_id_idx ON conversations(user_id);
CREATE INDEX conversations_created_at_idx ON conversations(created_at DESC);
CREATE INDEX conversations_updated_at_idx ON conversations(updated_at DESC);

-- RLS (Row Level Security) 정책
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 대화만 볼 수 있음
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 대화를 생성할 수 있음
CREATE POLICY "Users can insert own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 대화를 수정할 수 있음
CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- 사용자는 자신의 대화를 삭제할 수 있음
CREATE POLICY "Users can delete own conversations" ON conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Updated at 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Updated at 트리거
CREATE TRIGGER update_conversations_updated_at 
  BEFORE UPDATE ON conversations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 