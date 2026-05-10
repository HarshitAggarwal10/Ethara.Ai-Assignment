#!/usr/bin/env python3
"""
Simple Database Viewer for SQLite
View all tables, rows, and data in the task_manager.db database
"""

import sqlite3
import os
from pathlib import Path

def format_table(headers, rows, max_width=80):
    """Simple table formatter without external dependencies"""
    col_widths = [max(len(str(h)), max(len(str(row[i])) for row in rows) if rows else 0) for i, h in enumerate(headers)]
    col_widths = [min(w, 30) for w in col_widths]  # Cap at 30 chars per column
    
    sep = "+" + "+".join("-" * (w + 2) for w in col_widths) + "+"
    header_row = "|" + "|".join(f" {str(h):<{w}} " for w, h in zip(col_widths, headers)) + "|"
    
    lines = [sep, header_row, sep]
    for row in rows:
        row_str = "|" + "|".join(f" {str(row[i]):<{w}} " for i, w in enumerate(col_widths)) + "|"
        lines.append(row_str)
    lines.append(sep)
    
    return "\n".join(lines)

DB_PATH = os.path.join(os.path.dirname(__file__), 'instance', 'task_manager.db')

def get_connection():
    """Create a connection to the database"""
    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found at {DB_PATH}")
        return None
    
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row  # Access columns by name
        return conn
    except Exception as e:
        print(f"❌ Error connecting to database: {e}")
        return None

def get_tables(conn):
    """Get list of all tables in the database"""
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    return [row[0] for row in cursor.fetchall()]

def get_table_schema(conn, table_name):
    """Get schema information for a table"""
    cursor = conn.cursor()
    cursor.execute(f"PRAGMA table_info({table_name});")
    return cursor.fetchall()

def get_table_data(conn, table_name, limit=50):
    """Get data from a table"""
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM {table_name} LIMIT {limit};")
    columns = [description[0] for description in cursor.description]
    rows = cursor.fetchall()
    return columns, rows

def print_table_info(conn, table_name):
    """Print detailed information about a table"""
    print(f"\n{'='*80}")
    print(f"📊 TABLE: {table_name.upper()}")
    print(f"{'='*80}\n")
    
    # Print schema
    schema = get_table_schema(conn, table_name)
    print("📋 SCHEMA:")
    schema_data = [[col[1], col[2], "NOT NULL" if col[3] else "NULL", col[5]] for col in schema]
    headers = ["Column", "Type", "Constraint", "PK"]
    print(format_table(headers, schema_data))
    
    # Get and print data
    cursor = conn.cursor()
    cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
    row_count = cursor.fetchone()[0]
    
    print(f"\n📈 ROWS: {row_count}\n")
    
    if row_count > 0:
        columns, rows = get_table_data(conn, table_name)
        if rows:
            # Convert Row objects to tuples for formatting
            row_data = [tuple(row) for row in rows]
            print(format_table(columns, row_data))
        else:
            print("(No data to display)")
    else:
        print("(Table is empty)")

def main():
    """Main function"""
    print("\n" + "="*80)
    print("🗄️  TASK MANAGER DATABASE VIEWER")
    print("="*80)
    print(f"📂 Database Location: {DB_PATH}\n")
    
    conn = get_connection()
    if not conn:
        return
    
    try:
        # Get all tables
        tables = get_tables(conn)
        
        if not tables:
            print("❌ No tables found in the database")
            return
        
        print(f"✅ Found {len(tables)} table(s):\n")
        for i, table in enumerate(tables, 1):
            cursor = conn.cursor()
            cursor.execute(f"SELECT COUNT(*) FROM {table};")
            count = cursor.fetchone()[0]
            print(f"   {i}. {table} ({count} rows)")
        
        # Print detailed info for each table
        for table in tables:
            print_table_info(conn, table)
        
        print(f"\n{'='*80}")
        print("✅ Database view complete!")
        print(f"{'='*80}\n")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    main()
