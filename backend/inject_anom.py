import sqlite3
import json

def inject():
    conn = sqlite3.connect('real_weave.db')
    cursor = conn.cursor()
    
    # Anomaly
    cursor.execute('''
        INSERT OR IGNORE INTO anomalies (id, event_ids, type, severity, explanation, root_causes, confidence)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        'anom-05', 
        '[]', 
        'LatencyBleep', 
        0.15, 
        'Minor data latency detected in regional node.', 
        json.dumps(["Network Jitter"]), 
        0.85
    ))
    
    # Workflow
    cursor.execute('''
        INSERT OR IGNORE INTO anomaly_workflows (anomaly_id, status, owner, note, archived)
        VALUES (?, ?, ?, ?, ?)
    ''', ('anom-05', 'open', '', '', 0))
    
    conn.commit()
    conn.close()
    print("Injected anom-05 successfully")

if __name__ == '__main__':
    inject()
