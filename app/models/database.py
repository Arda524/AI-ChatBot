
import sqlite3
from datetime import datetime
from contextlib import contextmanager


class ChatDatabase:
    """Database manager for chat history"""
    
    def __init__(self, db_path='chat_history.db'):
        self.db_path = db_path
        self._init_db()
    
    @contextmanager
    def _get_connection(self):
        """Context manager for database connections"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()
    
    def _init_db(self):
        """Initialize database tables"""
        with self._get_connection() as conn:
            conn.executescript('''
                CREATE TABLE IF NOT EXISTS chat_messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT NOT NULL,
                    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
                    content TEXT NOT NULL,
                    source TEXT DEFAULT 'user',
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS user_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT UNIQUE NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_active DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE INDEX IF NOT EXISTS idx_user_timestamp 
                ON chat_messages(user_id, timestamp);
                
                CREATE INDEX IF NOT EXISTS idx_user_role 
                ON chat_messages(user_id, role);
            ''')
            conn.commit()
    
    def save_message(self, user_id, role, content, source='user'):
        """Save a message"""
        with self._get_connection() as conn:
            conn.execute('''
                INSERT INTO chat_messages (user_id, role, content, source)
                VALUES (?, ?, ?, ?)
            ''', (user_id, role, content, source if role == 'user' else 'bot'))
            
            conn.execute('''
                INSERT OR REPLACE INTO user_sessions (user_id, last_active)
                VALUES (?, ?)
            ''', (user_id, datetime.now()))
            
            conn.commit()
    
    def get_chat_history(self, user_id, limit=50):
        """Get chat history"""
        with self._get_connection() as conn:
            cursor = conn.execute('''
                SELECT role, content, source, timestamp
                FROM chat_messages
                WHERE user_id = ?
                ORDER BY timestamp ASC
                LIMIT ?
            ''', (user_id, limit))
            
            return [dict(row) for row in cursor.fetchall()]
    
    def clear_history(self, user_id):
        """Clear chat history"""
        with self._get_connection() as conn:
            conn.execute('DELETE FROM chat_messages WHERE user_id = ?', (user_id,))
            conn.execute('DELETE FROM user_sessions WHERE user_id = ?', (user_id,))
            conn.commit()