import os
import base64
import hashlib
import zlib
import json

# Configuration
VERSION = "2.5.0"
MAX_PACKET_SIZE = 50000  # Characters
ENCODING_PREFERENCE = "PLAIN" # "PLAIN", "B64", or "GZ_B64"
EXCLUDED_DIRS = {'.git', 'node_modules', '__pycache__', 'scratch', 'docs/context'}

def get_checksum(data):
    return hashlib.md5(data.encode('utf-8')).hexdigest()

def create_packet(packet_id, total_packets, files_data):
    header = f"ACE_PACKET_BEGIN [VERSION {VERSION}] [ID: {packet_id}/{total_packets}]"
    footer = "ACE_PACKET_END"
    
    body = ""
    for file_path, content, encoding in files_data:
        body += f"FILE: {file_path}\n"
        body += f"ENCODING: {encoding}\n"
        body += "---DATA---\n"
        body += content + "\n"
        body += "---DATA---\n"
    
    packet_content = f"{header}\n{body}{footer}"
    return packet_content

def process_files(root_dir):
    all_files = []
    for root, dirs, files in os.walk(root_dir):
        # Filter excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
        
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, root_dir)
            
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    encoding = "PLAIN"
                    
                    # Decide if we need B64 (binary-ish or very large)
                    if any(ord(c) > 127 for c in content) or len(content) > 10000:
                        # For now, let's keep it simple unless requested
                        pass
                    
                    all_files.append((rel_path, content, encoding))
            except Exception as e:
                print(f"Skipping {rel_path} due to error: {e}")
                
    return all_files

def run():
    print(f"Building ACE {VERSION} Phantom Link Packets...")
    files = process_files(".")
    
    packets = []
    current_packet_files = []
    current_size = 0
    
    for rel_path, content, encoding in files:
        file_entry_size = len(rel_path) + len(content) + 100
        
        if current_size + file_entry_size > MAX_PACKET_SIZE and current_packet_files:
            packets.append(current_packet_files)
            current_packet_files = []
            current_size = 0
            
        current_packet_files.append((rel_path, content, encoding))
        current_size += file_entry_size
        
    if current_packet_files:
        packets.append(current_packet_files)
        
    total = len(packets)
    for i, p_files in enumerate(packets):
        packet_text = create_packet(i + 1, total, p_files)
        filename = f"ace_packet_{i+1}_of_{total}.txt"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(packet_text)
        print(f"Generated {filename} ({len(packet_text)} chars)")

if __name__ == "__main__":
    run()
