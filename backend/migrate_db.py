import sqlite3

def migrate():
    conn = sqlite3.connect('real_weave.db')
    cursor = conn.cursor()
    
    # Check if columns exist and add them if not
    columns_to_add = [
        ("tracking_number", "TEXT"),
        ("carrier", "TEXT"),
        ("estimated_delivery", "DATETIME"),
        ("last_lat", "FLOAT"),
        ("last_lon", "FLOAT")
    ]
    
    for col_name, col_type in columns_to_add:
        try:
            cursor.execute(f"ALTER TABLE shipments ADD COLUMN {col_name} {col_type}")
            print(f"Added column {col_name}")
        except sqlite3.OperationalError:
            print(f"Column {col_name} already exists or error.")
            
    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate()
